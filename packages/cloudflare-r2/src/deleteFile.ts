import { VendorConfiguration } from 'sanity-plugin-external-files'
import { CloudflareR2Credentials } from '.'

const deleteFile: VendorConfiguration<CloudflareR2Credentials>['deleteFile'] =
  async ({ storedFile, credentials }) => {
    if (!credentials || typeof credentials.workerUrl !== 'string') {
      return 'missing-credentials'
    }

    const endpoint = credentials.workerUrl as string
    const url = `${endpoint}/${storedFile.cloudflareR2?.fileKey}`
    const authToken = credentials.secret

    // Delete file from Cloudflare R2
    // By sending a DELETE request to the Cloudflare Worker
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      mode: 'cors',
    }).then((response) => {
      if (response.ok) {
        return true as true
      } else {
        return 'error'
      }
    })

    return response
  }

export default deleteFile
