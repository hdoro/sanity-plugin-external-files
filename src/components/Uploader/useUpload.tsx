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
    // Even when using the original file name, we need to provide a unique identifier for it.
    // Else Firebase's storage will re-utilize the same file for 2 different uploads with the same file name, replacing the previous upload.
    return `${file.name}-${new Date().toISOString().replace(/\:/g, '-')}`
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

            callback({ type: 'VENDOR_PROGRESS', data: progress })
          },
          (error) => {
            callback({
              type: 'VENDOR_ERROR',
              error,
            })
          },
          async () => {
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
            const metadata = await uploadTask.snapshot.ref.getMetadata()

            callback({
              type: 'VENDOR_DONE',
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
        if (!context?.vendorUpload?.downloadURL || !context?.file) {
          return new Promise((_resolve, reject) =>
            reject('Invalid Firebase upload'),
          )
        }
        return new Promise(async (resolve, reject) => {
          let screenshot: SanityImageAssetDocument | undefined
          if (context.videoScreenshot?.type === 'image/png') {
            try {
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
            } catch (error) {
              reject('Failed to save image')
            }
          }
          try {
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
              firebase: {
                ...context.vendorUpload,
              },
              metadata: context.fileMetadata,
            })

            resolve(document)
          } catch (error) {
            reject('Failed to create document')
          }
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
