import { VendorConfiguration } from 'sanity-plugin-external-files'

const uploadFile: VendorConfiguration['uploadFile'] = ({
  credentials,
  onError,
  onSuccess,
  file,
  fileName,
}) => {
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

  const filePath = [credentials.folder, fileName].filter(Boolean).join('/')

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
      fileName: filePath,
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
      const fileKey = fields?.key || filePath
      const data = {
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
              // CDN - accepts a custom subdomain
              fileURL: credentials.subdomain
                ? `${credentials.subdomain}/${fileKey}`
                : `https://${subdomain}.cdn.digitaloceanspaces.com/${fileKey}`,
              digitalOcean: {
                key: fileKey,
                bucket: credentials.bucketKey,
                region: credentials.bucketRegion,
                // Non-CDN
                originURL: `https://${subdomain}.digitaloceanspaces.com/${fileKey}`,
              },
            })
          } else {
            onError({
              message: 'Ask your developer to check DigitalOcean permissions.',
              name: 'failed-presigned',
            })
          }
        })
        .catch((error) => {
          onError(error)
        })
    })
    .catch((error) => {
      onError(error)
    })
  return () => {
    try {
      if (controller?.abort) {
        controller.abort()
      }
    } catch (error) {}
  }
}

export default uploadFile
