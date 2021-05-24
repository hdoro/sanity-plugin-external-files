import React from 'react'
import { StateFrom } from 'xstate'
import { useMachine } from '@xstate/react'
import { DropzoneState, useDropzone } from 'react-dropzone'
import { useToast } from '@sanity/ui'
import { SanityImageAssetDocument } from '@sanity/client'
import { nanoid } from 'nanoid'

import uploadMachine from './uploadMachine'
import { UploaderProps } from './Uploader'
import parseAccept from '../../scripts/parseAccept'

/**
 * Creates unique file names for uploads if storeOriginalFilename is set to false
 */
function getFileRef({
  storeOriginalFilename,
  file,
}: Pick<UploaderProps, 'storeOriginalFilename'> & { file: File }) {
  if (storeOriginalFilename) {
    return file.name
  }
  return `${new Date().toISOString().replace(/\:/g, '-')}-${nanoid(6)}.${
    file.name.split('.').slice(-1)[0]
  }`
}

export interface useUploadReturn {
  dropzone: DropzoneState
  state: StateFrom<typeof uploadMachine>
  cancelUpload: () => void
  retry: () => void
}

const useUpload = ({
  accept,
  vendorClient,
  sanityClient,
  storeOriginalFilename = true,
  onSuccess,
}: UploaderProps): useUploadReturn => {
  const toast = useToast()
  const [state, send] = useMachine(uploadMachine, {
    actions: {
      invalidFileToast: () =>
        toast.push({
          title: `Invalid file type uploaded`,
          status: 'error',
        }),
    },
    services: {
      uploadToFirebase: (context) => (callback) => {
        if (!context.file?.name || !vendorClient) {
          callback({ type: 'CANCEL_INPUT' })
          return
        }
        const ref = vendorClient
          .storage()
          .ref(getFileRef({ file: context.file, storeOriginalFilename }))
        const uploadTask = ref.put(context.file, {
          customMetadata: {
            uploadedFrom: 'sanity-plugin-firebase-dam',
          },
        })

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.ceil(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 90,
            )

            callback({ type: 'FIREBASE_PROGRESS', data: progress })
          },
          (error) => {
            // @TODO: Deal with error
            console.error({ UploadError: error })
          },
          async () => {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
            const metadata = await uploadTask.snapshot.ref.getMetadata()

            callback({
              type: 'FIREBASE_DONE',
              data: {
                downloadURL,
                ...metadata,
              },
            })
          },
        )

        return () => {
          try {
            uploadTask.cancel()
          } catch (error) {}
        }
      },
      uploadToSanity: (context) => {
        if (!context?.firebaseUpload?.downloadURL || !context?.file) {
          return new Promise((_resolve, reject) =>
            reject('Invalid Firebase upload'),
          )
        }
        return new Promise(async (resolve, reject) => {
          let screenshot: SanityImageAssetDocument | undefined
          if (context.videoScreenshot?.type === 'image/png') {
            screenshot = await sanityClient.assets.upload(
              'image',
              context.videoScreenshot,
              {
                source: { id: 'firebase-dam', name: 'Firebase DAM' },
                filename: getFileRef({
                  file: context.file as File,
                  storeOriginalFilename,
                }),
              },
            )
          }
          const document = await sanityClient.create({
            _type: 'firebase.storedFile',
            screenshot: screenshot
              ? {
                  _type: 'image',
                  asset: {
                    _type: 'reference',
                    _ref: screenshot?._id,
                  },
                }
              : undefined,
            // @TODO: consider having a custom id based on the file's fullPath
            // _id: `firebase-media-${context.firebaseUpload?.fullPath.replace(
            //   /\./g,
            //   '-',
            // )}`,
            firebase: {
              ...context.firebaseUpload,
            },
            metadata: context.fileMetadata,
          })

          resolve(document)
        })
      },
    },
    devTools: true,
  })

  const dropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      send({
        type: 'SELECT_FILE',
        file: acceptedFiles?.[0],
      })
    },
    accept: parseAccept(accept),
    // Only allow 1 file to be uploaded
    maxFiles: 1,
  })

  function cancelUpload() {
    send({
      type: 'CANCEL_INPUT',
    })
  }

  function retry() {
    send({
      type: 'RETRY',
    })
  }

  React.useEffect(() => {
    if (state.value === 'success' && state.context.sanityUpload && onSuccess) {
      // @TODO: catch error if sanityUpload not defined
      onSuccess(state.context.sanityUpload)
      send('RESET_UPLOAD')
    }
  }, [state.value])

  return {
    dropzone,
    state,
    cancelUpload,
    retry,
  }
}

export default useUpload
