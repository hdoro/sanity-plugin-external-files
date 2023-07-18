const { createPresignedPost } = require('@aws-sdk/s3-presigned-post')
const { S3Client } = require('@aws-sdk/client-s3')
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

function getRandomKey() {
  return Math.random().toFixed(10).replace('0.', '')
}

/**
 *
 * @param {{ contentType: string; fileName: string; secret?: string }} body
 * @param {http.ServerResponse<http.IncomingMessage> & {    req: http.IncomingMessage;}} response
 */
async function DigitalOceanGetSignedUrl(body, response) {
  const { contentType, fileName, secret } = body || {}

  response.setHeader('Content-Type', 'application/json')
  if (typeof SECRET !== 'undefined' && secret !== SECRET) {
    response.statusCode = 401
    return response.end(
      JSON.stringify({
        message: 'Unauthorized',
      }),
    )
  }
  const objectKey =
    fileName ||
    `${getRandomKey()}-${getRandomKey()}-${contentType || 'unknown-type'}`
  try {
    const signed = await createPresignedPost(client, {
      Bucket: BUCKET,
      Key: objectKey,
      Conditions: contentType ? [['eq', '$Content-Type', contentType]] : [],
      Fields: {
        key: objectKey,
        acl: 'public-read',
      },
      Expires: 30,
      ContentType: contentType,
    })
    response.statusCode = 200
    return response.end(JSON.stringify(signed))
  } catch (error) {
    response.statusCode = 500
    return response.end(JSON.stringify(error))
  }
}

module.exports = DigitalOceanGetSignedUrl
