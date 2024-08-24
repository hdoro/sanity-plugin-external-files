
interface Env {
    R2_BUCKET: R2Bucket;
    SECRET: string;
    ALLOWED_ORIGINS: string[];
}

/**
 * The main handler function for the Cloudflare Worker
 */
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const method = request.method.toUpperCase()

        // Return a 200 for OPTIONS request to ensure browsers can process CORS in the Sanity studio
        if (method === 'OPTIONS') {
            return response(200, { message: 'Success' }, request, env.ALLOWED_ORIGINS);
        }

        if (['PUT', 'DELETE'].includes(method)) {

            const auth = request.headers.get("Authorization");
            const expectedAuth = `Bearer ${env.SECRET}`;

            if (!auth || auth !== expectedAuth) {
                return response(401, { message: 'Unauthorized' }, request, env.ALLOWED_ORIGINS);
            }
        }


        if (method === "PUT") {
            const url = new URL(request.url);
            const key = url.pathname.slice(1);
            await env.R2_BUCKET.put(key, request.body);
            return response(200, { message: `Object ${key} uploaded successfully!` }, request, env.ALLOWED_ORIGINS);
        }

        if (method === "DELETE") {
            const url = new URL(request.url);
            const key = url.pathname.slice(1);
            await env.R2_BUCKET.delete(key);
            return response(200, { message: `Object ${key} deleted successfully!` }, request, env.ALLOWED_ORIGINS);
        }

        return response(400, { message: 'Invalid request' }, request, env.ALLOWED_ORIGINS);



        /*const { secret } = body;

        if (typeof env.SECRET !== 'undefined' && secret !== env.SECRET) {
            return response(401, {
                message: 'Unauthorized',
            }, request, env.ALLOWED_ORIGINS);
        }

        // Get R2 bucket (assuming you've set the R2 bucket binding in your worker environment)
        const bucket = env.R2_BUCKET; // Replace R2_BUCKET with your actual binding name

        // SIGNED URL CREATION 
        if ('fileName' in body) {
            const { contentType, fileName } = body;

            const objectKey =
                fileName ||
                `${getRandomKey()}-${getRandomKey()}-${contentType || 'unknown-type'}`;

            try {
                const signedUrl = await createSignedUrl(bucket, 'PUT', contentType);
                return response(200, { url: signedUrl }, request, env.ALLOWED_ORIGINS);
            } catch (error) {
                return response(500, {
                    message: 'Failed creating signed URL',
                    error,
                }, request, env.ALLOWED_ORIGINS);
            }
        }

        if (request.method)

            // OBJECT DELETION 
            if ('fileKey' in body) {
                const { fileKey } = body;

                try {
                    await bucket.delete(fileKey);
                    return response(200, { message: 'success' }, request, env.ALLOWED_ORIGINS);
                } catch (error) {
                    return response(500, {
                        message: 'Failed deleting file',
                        fileKey,
                    }, request, env.ALLOWED_ORIGINS);
                }
            }

        return response(400, {
            message: 'Invalid request',
        }, request, env.ALLOWED_ORIGINS);*/
    },
};

/**
         * Helper function to return a JSON response
         * @param {number} statusCode
         * @param {Object} body
         */
function response(statusCode: number, body: Object, request: Request, ALLOWED_ORIGINS: string[]): Response {

    const origin = request.headers.get('Origin') || '';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
        'Access-Control-Allow-Methods': 'OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': '*',
    };

    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: headers,
    });
}

/**
 * Generate a random key for file naming
 
function getRandomKey() {
    return Math.random().toFixed(10).replace('0.', '');
}*/

/**
 * Create a signed URL for R2
 * @param {R2Bucket} bucket - The R2 bucket instance
 * @param {string} method - The HTTP method (e.g., 'PUT', 'GET')
 * @param {string} contentType - The content type of the file
 * @returns {string} - The signed URL
 
async function createSignedUrl(bucket: R2Bucket, method:, contentType) {
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
}*/