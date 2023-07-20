const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const http = require('http')

require('dotenv').config()

// === CONFIG ===
// 🚨 Don't forget to configure CORS in Digital Ocean Spaces
const BUCKET = process.env.DO_SPACES_BUCKET
const REGION = process.env.DO_SPACES_REGION
const SECRET = process.env.UPLOADER_SECRET || undefined

const ENDPOINT = `https://${REGION}.digitaloceanspaces.com`

const client = new S3Client({
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY_ID,
    secretAccessKey: process.env.DO_SPACES_SECRET_ACCESS_KEY,
  },
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: REGION,
})

/**
 *
 * @param {{ contentType: string; fileName: string; secret?: string }} body
 * @param {http.ServerResponse<http.IncomingMessage> & {    req: http.IncomingMessage;}} response
 */
async function DigitalOceanDeleteObject(body, response) {
  const { fileKey, secret } = body || {}

  response.setHeader('Content-Type', 'application/json')
  if (typeof SECRET !== 'undefined' && secret !== SECRET) {
    response.statusCode = 401
    return response.end(
      JSON.stringify({
        message: 'Unauthorized',
      }),
    )
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: fileKey,
    })
    await client.send(command)
    response.statusCode = 200
    return response.end(JSON.stringify({ message: 'ok' }))
  } catch (error) {
    console.error('[do/delete-object] failed', error)
    response.statusCode = 500
    return response.end(JSON.stringify(error))
  }
}

module.exports = DigitalOceanDeleteObject
