import { SanityImageAssetDocument } from '@sanity/client'
import { useToast } from '@sanity/ui'
import { useMachine } from '@xstate/react'
import React from 'react'
import { DropzoneState, useDropzone } from 'react-dropzone'
import { StateFrom } from 'xstate'
import getBasicFileMetadata from '../../scripts/getBasicMetadata'
import getFileRef from '../../scripts/getFileRef'
import { useSanityClient } from '../../scripts/sanityClient'
import { SanityUpload } from '../../types'
import { CredentialsContext } from '../Credentials/CredentialsProvider'
import { UploaderProps } from './Uploader'
import uploadMachine from './uploadMachine'

export interface useUploadReturn {
  dropzone: DropzoneState
  state: StateFrom<typeof uploadMachine>
  cancelUpload: () => void
  retry: () => void
}

const useUpload = ({
  accept,
  vendorConfig,
  storeOriginalFilename = true,
  onSuccess,
}: UploaderProps): useUploadReturn => {
  const toast = useToast()
  const { credentials } = React.useContext(CredentialsContext)
  const sanityClient = useSanityClient()
  const [state, send] = useMachine(uploadMachine, {
    actions: {
      invalidFileToast: () =>
        toast.push({
          title: `Invalid file type uploaded`,
          status: 'error',
        }),
    },
    services: {
      uploadToVendor: (context) => (callback) => {
        if (!context.file?.name || !vendorConfig?.uploadFile || !credentials) {
          callback({ type: 'CANCEL_INPUT' })
          return
        }

        const cleanUp = vendorConfig.uploadFile({
          credentials,
          file: context.file,
          fileName: getFileRef({
            file: context.file as File,
            storeOriginalFilename,
          }),
          onError: (error) =>
            callback({
              type: 'VENDOR_ERROR',
              error,
            }),
          updateProgress: (progress) =>
            callback({ type: 'VENDOR_PROGRESS', data: progress }),
          onSuccess: (uploadedFile) =>
            callback({
              type: 'VENDOR_DONE',
              data: uploadedFile,
            }),
        })

        return () => {
          if (typeof cleanUp === 'function') {
            cleanUp()
          }
        }
      },
      uploadToSanity: (context) => {
        if (!context?.vendorUpload?.fileURL || !context?.file) {
          return new Promise((_resolve, reject) =>
            reject('Invalid Vendor upload'),
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
                  source: {
                    id: `${vendorConfig.id}`,
                    name: `${vendorConfig.id} (external DAM)`,
                  },
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
              _type: `${vendorConfig.id}.storedFile`,
              screenshot: screenshot
                ? {
                    _type: 'image',
                    asset: {
                      _type: 'reference',
                      _ref: screenshot?._id,
                    },
                  }
                : undefined,
              ...getBasicFileMetadata({
                file: context.file as File,
                storeOriginalFilename,
              }),
              ...context.vendorUpload,
              ...(context.formatMetadata || {}),
            } as SanityUpload)

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
    accept,
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
