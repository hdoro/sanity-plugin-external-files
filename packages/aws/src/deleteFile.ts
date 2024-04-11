import { VendorConfiguration } from 'sanity-plugin-external-files'
import { S3Credentials } from '.'

const deleteFile: VendorConfiguration<S3Credentials>['deleteFile'] = async ({
  storedFile,
  credentials,
}) => {
  if (!credentials || typeof credentials.deleteObjectEndpoint !== 'string') {
    return 'missing-credentials'
  }

  const endpoint = credentials.deleteObjectEndpoint as string
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        fileKey: storedFile.s3?.key,
        secret: credentials.secretForValidating,
        bucketKey: credentials.bucketKey,
        bucketRegion: credentials.bucketRegion,
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
}

export default deleteFile
