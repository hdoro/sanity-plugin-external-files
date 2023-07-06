// Generate plain NodeJS server
const http = require('http')
const DigitalOceanGetSignedUrl = require('./do.getSignedUrl')
const port = 4444

require('dotenv').config()

const server = http.createServer(async (request, response) => {
  response.setHeader('Content-Type', 'application/json')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Headers', '*')

  if (request.method?.toUpperCase() === 'OPTIONS') {
    response.statusCode = 200
    return response.end()
  }

  let body = ''
  request.on('data', (chunk) => {
    body += chunk.toString()
  })
  request.on('end', async () => {
    try {
      const json = JSON.parse(body)

      if (request.url.endsWith('do/signed-url')) {
        return await DigitalOceanGetSignedUrl(json, response)
      }
    } catch (error) {
      response.statusCode = 500
      return response.end(JSON.stringify({ error }))
    }

    response.statusCode = 200
    response.end(JSON.stringify({ message: 'Hello World' }))
  })
})

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})
