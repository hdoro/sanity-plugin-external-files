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
            onSuccess({
              fileURL: `https://s3.${credentials.bucketRegion}.amazonaws.com/${credentials.bucketKey}/${fileKey}`,
              s3: {
                key: fileKey,
                bucket: credentials.bucketKey,
                region: credentials.bucketRegion,
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
}

export default uploadFile
