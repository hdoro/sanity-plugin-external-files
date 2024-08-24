
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
    },
};

/**
 * ## `response`
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