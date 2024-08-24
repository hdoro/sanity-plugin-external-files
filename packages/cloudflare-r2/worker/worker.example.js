// === 🚨 CONFIG (bucket name is passed from the Sanity studio) ===
const SECRET = undefined; // (Optional) set a secret. Needs to be added to the Sanity plugin as well!

const SHARED_HEADERS = {
    'Content-Type': 'application/json',
};

/**
 * The main handler function for the Cloudflare Worker
 */
export default {
    async fetch(request) {
        const method = request.method;

        // Return a 200 for OPTIONS request to ensure browsers can process CORS in the Sanity studio
        if (method.toUpperCase() === 'OPTIONS') {
            return response(200, {});
        }

        /**
         * @type {{ secret?: string; bucketName?: string } & ({ fileName: string; contentType?: string } | { secret?: string; fileKey: string })}
         */
        let body = {};
        try {
            body = await request.json();
        } catch (error) {
            return response(400, {
                message: 'Missing body',
            });
        }

        const { bucketName, secret } = body;

        if (typeof SECRET !== 'undefined' && secret !== SECRET) {
            return response(401, {
                message: 'Unauthorized',
            });
        }

        if (!bucketName) {
            return response(400, {
                message: 'Missing `bucketName`',
            });
        }

        // Get R2 bucket (assuming you've set the R2 bucket binding in your worker environment)
        const bucket = R2_BUCKET; // Replace R2_BUCKET with your actual binding name

        /** SIGNED URL CREATION */
        if ('fileName' in body) {
            const { contentType, fileName } = body;

            const objectKey =
                fileName ||
                `${getRandomKey()}-${getRandomKey()}-${contentType || 'unknown-type'}`;

            try {
                const signedUrl = await createSignedUrl(bucket, objectKey, 'PUT', contentType);
                return response(200, { url: signedUrl });
            } catch (error) {
                return response(500, {
                    message: 'Failed creating signed URL',
                    error,
                });
            }
        }

        /** OBJECT DELETION */
        if ('fileKey' in body) {
            const { fileKey } = body;

            try {
                await bucket.delete(fileKey);
                return response(200, { message: 'success' });
            } catch (error) {
                return response(500, {
                    message: 'Failed deleting file',
                    fileKey,
                });
            }
        }

        return response(400, {
            message: 'Invalid request',
        });

        /**
         * Helper function to return a JSON response
         * @param {number} statusCode
         * @param {Object} body
         */
        function response(statusCode, body) {
            return new Response(JSON.stringify(body), {
                status: statusCode,
                headers: SHARED_HEADERS,
            });
        }
    },
};

/**
 * Generate a random key for file naming
 */
function getRandomKey() {
    return Math.random().toFixed(10).replace('0.', '');
}

/**
 * Create a signed URL for R2
 * @param {R2Bucket} bucket - The R2 bucket instance
 * @param {string} objectKey - The object key (file path)
 * @param {string} method - The HTTP method (e.g., 'PUT', 'GET')
 * @param {string} contentType - The content type of the file
 * @returns {string} - The signed URL
 */
async function createSignedUrl(bucket, objectKey, method, contentType) {
    const headers = {
        'Content-Type': contentType,
    };
    const expiration = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes expiration

    const signature = await bucket.createSignedUrl({
        method,
        headers,
        expires: expiration,
    });

    return signature;
}