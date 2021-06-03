import pluginConfig from 'config:s3-dam'
import { VendorConfiguration } from 'sanity-plugin-external-dam/lib/types'
import { LockIcon, PinIcon } from '@sanity/icons'

export const DEFAULT_ACCEPT = pluginConfig?.defaultAccept || [
  'video/*',
  'audio/*',
]

const config: VendorConfiguration = {
  id: 's3',
  defaultAccept: DEFAULT_ACCEPT,
  credentialsFields: [
    {
      name: 'getSignedUrlEndpoint',
      title: "Endpoint for getting S3's signed URL",
      icon: PinIcon,
      type: 'string',
    },
    {
      name: 'bucketKey',
      title: 'Bucket key',
      icon: LockIcon,
      type: 'string',
    },
  ],
  deleteFile: async ({ storedFile, credentials }) => {
    // @TODO
    return 'error'
  },
  uploadFile: ({ credentials, onError, onSuccess, file, fileName }) => {
    if (
      !credentials ||
      typeof credentials.getSignedUrlEndpoint !== 'string' ||
      typeof credentials.bucketKey !== 'string'
    ) {
      onError({
        name: 'missing-credentials',
        message: 'Missing correct credentials',
      })
    }

    // On cancelling fetch: https://davidwalsh.name/cancel-fetch
    let signal: AbortSignal | undefined
    let controller: AbortController | undefined
    try {
      controller = new AbortController()
      signal = controller.signal
    } catch (error) {}

    const endpoint = credentials.getSignedUrlEndpoint as string
    fetch(
      `${endpoint}${endpoint.includes('?') ? '&' : '?'}contentType=${
        file.type
      }&fileName=${fileName}`,
      { signal },
    ).then((response) =>
      response.json().then(({ url, fields }) => {
        // Reference: https://github.com/codyseibert/youtube/blob/master/s3-upload-example/index.html
        const data = {
          bucket: credentials.bucketKey,
          ...fields,
          'Content-Type': file.type,
          file,
        }

        const formData = new FormData()
        for (const name in data) {
          formData.append(name, data[name])
        }

        fetch(url, {
          method: 'POST',
          body: formData,
        })
          .then((res) => {
            onSuccess(res)
          })
          .catch((error) => onError(error))
      }),
    )
    return () => {
      try {
        if (controller?.abort) {
          controller.abort()
        }
      } catch (error) {}
    }
  },
}

export default config
