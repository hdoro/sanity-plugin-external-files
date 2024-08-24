import { VendorConfiguration } from 'sanity-plugin-external-files'
import { CloudflareR2Credentials } from '.'

const deleteFile: VendorConfiguration<CloudflareR2Credentials>['deleteFile'] =
    async ({ storedFile, credentials }) => {
        if (!credentials || typeof credentials.deleteObjectEndpoint !== 'string') {
            return 'missing-credentials'
        }

        const endpoint = credentials.deleteObjectEndpoint as string
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify({
                    fileKey: storedFile.cloudflareR2?.key,
                    secret: credentials.secret,
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
