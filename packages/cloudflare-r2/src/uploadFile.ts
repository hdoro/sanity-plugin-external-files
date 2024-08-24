import { VendorConfiguration } from 'sanity-plugin-external-files'
import { CloudflareR2Credentials } from '.'

const uploadFile: VendorConfiguration<CloudflareR2Credentials>['uploadFile'] =
    ({ credentials, onError, onSuccess, file, fileName }) => {
        if (
            !credentials ||
            typeof credentials.getSignedUrlEndpoint !== 'string' ||
            typeof credentials.bucketName !== 'string'
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
        } catch (error) { }

        const endpoint = credentials.getSignedUrlEndpoint as string
        fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                fileName: filePath,
                contentType: file.type,
                secret: credentials.secret,
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
                            onSuccess({
                                fileUrl: `${credentials.url}/${fileKey}`,
                                cloudflareR2: {
                                    key: fileKey,
                                    bucket: credentials.bucketName,
                                    baseUrl: credentials.url,
                                },
                            })
                        } else {
                            onError({
                                message:
                                    'Ask your developer to check Cloudflare R2 permissions.',
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
            } catch (error) { }
        }
    }

export default uploadFile
