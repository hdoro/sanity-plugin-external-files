import { VendorConfiguration } from 'sanity-plugin-external-files'
import { S3Credentials } from '.'

const uploadFile: VendorConfiguration<S3Credentials>['uploadFile'] = ({
  credentials,
  onError,
  onSuccess,
  file,
  fileName,
}) => {
  if (
    !credentials ||
    typeof credentials.getSignedUrlEndpoint !== 'string' ||
    typeof credentials.bucketKey !== 'string' ||
    !URL.canParse(credentials.getSignedUrlEndpoint) ||
    !credentials.bucketKey
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
      bucketKey: credentials.bucketKey,
      bucketRegion: credentials.bucketRegion,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    signal,
  })
    .then((response) => response.json())
    .then(({ url, fields }) => {
      if (!url || !URL.canParse(url)) {
        onError({
          message:
            "Ask your developer to rectify the AWS Lambda function that returns the asset's pre-signed url.",
          name: 'incorrect-presigned',
        })
      }

      const fileKey = fields?.key || filePath
      let presignedPromise: Promise<Response>

      /** ===================================
       * OLDER VERSION OF THE LAMBDA FUNCTION
       *
       * the presigned URLs generated with the old `aws-sdk` returned a `fields` object
       * and expected a POST request with those fields in the `formData`
       */
      if (fields) {
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
        presignedPromise = fetch(url, {
          method: 'POST',
          body: formData,
          mode: 'cors',
          signal,
        })
      } else {
        /** ====================================
         * NEWER VERSIONS OF THE LAMBDA FUNCTION
         *
         * `@aws-sdk/s3-request-presigner` returns a single URL string and expects PUT requests with
         * the file to be uploaded as the binary body. It also requires an explicit `Content-Type` header.
         */
        presignedPromise = fetch(url, {
          method: 'PUT',
          body: file,
          mode: 'cors',
          headers: {
            'Content-Type': file.type,
          },
          signal,
        })
      }

      presignedPromise
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
      onError({
        message: 'Ask your developer to check the AWS Lambda function.',
        name: 'failed-presigned',
        cause: error?.cause,
        stack: error?.stack,
      })
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
