const AWS = require('aws-sdk')

// === CONFIG ===
// 🚨 Don't forget to configure CORS in Digital Ocean Spaces
const BUCKET = 'YOUR_BUCKET'
const REGION = 'YOUR_REGION'
const SECRET = undefined // (Optional) set a secret. Needs to be added to the Sanity plugin as well!

const ENDPOINT = `${REGION}.digitaloceanspaces.com`
const spacesEndpoint = new AWS.Endpoint(ENDPOINT)
const credentials = new AWS.Credentials({
  accessKeyId: process.env.SPACES_KEY,
  secretAccessKey: process.env.SPACES_SECRET,
})

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  credentials,
})

function getRandomKey() {
  return Math.random().toFixed(10).replace('0.', '')
}

const SHARED_HEADERS = {
  'Content-Type': 'application/json',
}

exports.handler = async (event, _context, callback) => {
  const method =
    event.httpMethod ||
    event?.requestContext?.httpMethod ||
    event?.requestContext?.http?.method
  if (method?.toUpperCase() === 'OPTIONS') {
    return callback(null, {
      statusCode: 200,
      body: JSON.stringify(event),
      headers: SHARED_HEADERS,
    })
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch (error) {
    return callback(null, {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing body',
        ...event,
      }),
      headers: SHARED_HEADERS,
    })
  }

  const { contentType, fileName, secret } = body || {}

  if (typeof SECRET !== 'undefined' && secret !== SECRET) {
    return callback(null, {
      statusCode: 401,
      body: JSON.stringify({
        message: 'Unauthorized',
        ...event,
      }),
      headers: SHARED_HEADERS,
    })
  }
  s3.createPresignedPost(
    {
      Fields: {
        key:
          fileName ||
          `${getRandomKey()}-${getRandomKey()}-${
            contentType || 'unknown-type'
          }`,
        acl: 'public-read',
      },
      Conditions: contentType ? [['eq', '$Content-Type', contentType]] : [],
      Expires: 30,
      Bucket: BUCKET,
      ContentType: contentType,
    },
    (error, signed) => {
      if (!!error) {
        return callback(error, {
          statusCode: 500,
          body: JSON.stringify(error),
          headers: SHARED_HEADERS,
        })
      }
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify(signed),
        headers: SHARED_HEADERS,
      })
    },
  )
}
