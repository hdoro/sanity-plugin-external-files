const AWS = require('aws-sdk')
const { nanoid } = require('nanoid')

const s3 = new AWS.S3({
  region: 'YOUR_REGION', // replace with your region
})

// Reference: https://github.com/codyseibert/youtube/blob/master/s3-upload-example/index.js
exports.getSignedUrl = async (request, response) => {
  const { contentType, fileName } = request.query
  await s3.createPresignedPost(
    {
      Fields: {
        key: fileName || nanoid(),
      },
      Conditions: contentType
        ? [['starts-with', '$Content-Type', contentType]]
        : [],
      Expires: 30,
      Bucket: 'YOUR_BUCKET',
    },
    (error, signed) => {
      if (error) {
        return response({
          statusCode: 500,
          body: JSON.stringify(error),
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      return response({
        statusCode: 200,
        body: JSON.stringify(signed),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    },
  )
}
