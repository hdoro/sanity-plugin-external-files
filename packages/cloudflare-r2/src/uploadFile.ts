import { VendorConfiguration } from 'sanity-plugin-external-files'
import { CloudflareR2Credentials } from '.'

const uploadFile: VendorConfiguration<CloudflareR2Credentials>['uploadFile'] =
  ({ credentials, onError, onSuccess, file, fileName }) => {
    if (!credentials || typeof credentials.workerUrl !== 'string') {
      onError({
        name: 'missing-credentials',
        message: 'Missing correct credentials',
      })
    }

    const filePath = [credentials.folder, fileName]
      .filter(Boolean)
      .join('/')
      .replace(/\s/g, '-')

    const endpoint = credentials.workerUrl as string
    const url = `${endpoint}/${filePath}`
    const authToken = credentials.secret

    // Upload file to Cloudflare R2
    // By sending a PUT request to the Cloudflare Worker
    fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': file.type,
      },
      body: file,
      mode: 'cors',
    }).then((response: Response) => {
      if (response.ok) {
        onSuccess({
          fileURL: `${credentials.url}/${filePath}`,
          cloudflareR2: {
            fileKey: filePath,
            baseUrl: credentials.url,
          },
        })
      } else {
        onError({
          message: 'Ask your developer to check Cloudflare R2 permissions.',
          name: 'failed-presigned',
        })
      }
    })

    return () => {}
  }

export default uploadFile
