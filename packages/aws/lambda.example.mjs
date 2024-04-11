import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// === 🚨 CONFIG (bucket key and region is passed from the Sanity studio) ===
const SECRET = undefined // (Optional) set a secret. Needs to be added to the Sanity plugin as well!

const SHARED_HEADERS = {
  'Content-Type': 'application/json',
}

/**
 * @type {import('aws-lambda').Handler}
 */
export const handler = async (event, _context, callback) => {
  const method =
    event.httpMethod ||
    event?.requestContext?.httpMethod ||
    event?.requestContext?.http?.method

  // Return a 200 for OPTIONS request to ensure browsers can process CORS in the Sanity studio
  if (method?.toUpperCase() === 'OPTIONS') {
    return response(200, {})
  }

  /**
   * @type {{ secret?: string; bucketKey?: string; bucketRegion?: string } & ({ fileName: string; contentType?: string } | { secret?: string; fileKey: string })}
   */
  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch (error) {
    return response(400, {
      message: 'Missing body',
    })
  }

  const { bucketKey, bucketRegion, secret } = body

  if (typeof SECRET !== 'undefined' && secret !== SECRET) {
    return response(401, {
      message: 'Unauthorized',
    })
  }

  if (!bucketKey || !bucketRegion) {
    return response(400, {
      message: 'Missing `bucketKey` or `bucketRegion`',
    })
  }

  const s3Client = new S3Client({
    region: bucketRegion,
  })

  /** SIGNED URL CREATION */
  if ('fileName' in body) {
    const { contentType, fileName } = body

    const createSignedUrl = new PutObjectCommand({
      Bucket: bucketKey,
      Key:
        fileName ||
        `${getRandomKey()}-${getRandomKey()}-${contentType || 'unknown-type'}`,
      ContentType: contentType,

      // Can be publicly read
      ACL: 'public-read',
    })

    try {
      const url = await getSignedUrl(s3Client, createSignedUrl)

      return response(200, { url })
    } catch (error) {
      return response(500, {
        message: 'Failed creating signed URL',
        error,
      })
    }
  }

  /** OBJECT DELETION */
  if ('fileKey' in body) {
    const { fileKey } = body

    const deleteObject = new DeleteObjectCommand({
      Bucket: bucketKey,
      Key: fileKey,
    })

    try {
      await s3Client.send(deleteObject)

      return response(200, { message: 'success' })
    } catch (error) {
      return response(500, {
        message: 'Failed deleting file',
        fileKey,
      })
    }
  }

  return response(400, {
    message: 'Invalid request',
  })

  /**
   * @param {number} statusCode
   * @param {Object} body
   */
  function response(statusCode, body) {
    return callback(null, {
      statusCode,
      body: JSON.stringify(body),
      headers: SHARED_HEADERS,
    })
  }
}

function getRandomKey() {
  return Math.random().toFixed(10).replace('0.', '')
}
