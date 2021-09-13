import { VendorConfiguration } from 'sanity-plugin-external-dam/lib/types'
import {
  LockIcon,
  PinIcon,
  TrashIcon,
  EyeClosedIcon,
  EarthGlobeIcon,
} from '@sanity/icons'

export const DEFAULT_ACCEPT = [
  'video/*',
  'audio/*',
]


const config: VendorConfiguration = {
  id: 'digital-ocean-files',
  customDataFieldName: 'digitalOcean',
  defaultAccept: DEFAULT_ACCEPT,
  toolTitle: 'Videos & audio (DigitalOcean)',
  credentialsFields: [
    {
      name: 'bucketKey',
      title: 'Digital Ocean Space (bucket) key',
      icon: LockIcon,
      type: 'string',
    },
    {
      name: 'bucketRegion',
      title: 'Space (bucket) region',
      icon: EarthGlobeIcon,
      type: 'string',
    },
    {
      name: 'getSignedUrlEndpoint',
      title: "Endpoint for getting Space's signed URL",
      icon: PinIcon,
      type: 'string',
    },
    {
      name: 'deleteObjectEndpoint',
      title: 'Endpoint for deleting an object in Space',
      icon: TrashIcon,
      type: 'string',
    },
    {
      name: 'secretForValidating',
      title: 'Secret for validating the signed URL request (optional)',
      icon: EyeClosedIcon,
      type: 'string',
    },
  ],
  
  deleteFile: async ({ storedFile, credentials }) => {
    if (!credentials || typeof credentials.deleteObjectEndpoint !== 'string') {
      return 'missing-credentials'
    }

    const endpoint = credentials.deleteObjectEndpoint as string
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          fileKey: storedFile.digitalOcean?.key,
          secret: credentials.secretForValidating,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log({ res })
      if (res.ok) {
        return true
      } else {
        return 'error'
      }
    } catch (error: any) {
      return error?.message || 'error'
    }
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
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        fileName,
        contentType: file.type,
        secret: credentials.secretForValidating,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      signal,
    })
      .then((response) => response.json())
      .then(({ url, fields }) => {
        const fileKey = fields?.key || fileName
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
          mode: 'cors',
          signal,
        })
          .then((res) => {
            if (res.ok) {
              const subdomain = `${credentials.bucketKey}.${credentials.bucketRegion}`
              onSuccess({
                // CDN
                fileURL: `https://${subdomain}.cdn.digitaloceanspaces.com/${fileKey}`,
                digitalOcean: {
                  key: fileKey,
                  bucket: credentials.bucketKey,
                  region: credentials.bucketRegion,
                  // Non-CDN
                  originURL: `https://${subdomain}.digitaloceanspaces.com/${fileKey}`,
                },
              })
            } else {
              console.log({
                objectPostFaultyResponse: res,
              })
              onError({
                message: 'Ask your developer to check AWS permissions.',
                name: 'failed-presigned',
              })
            }
          })
          .catch((error) => {
            console.log({ objectPostError: error })
            onError(error)
          })
      })
      .catch((error) => {
        console.log({ presignedUrlFailure: error })
        onError(error)
      })
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
