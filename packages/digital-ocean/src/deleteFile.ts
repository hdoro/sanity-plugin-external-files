import { VendorConfiguration } from 'sanity-plugin-external-files'
import { DigitalOceanCredentials } from '.'

const deleteFile: VendorConfiguration<DigitalOceanCredentials>['deleteFile'] =
  async ({ storedFile, credentials }) => {
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
