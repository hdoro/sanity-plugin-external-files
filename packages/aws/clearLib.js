const fs = require('fs')

// directory path
const dir = 'lib'

// delete directory recursively
try {
  fs.rmSync(dir, { recursive: true })

  console.log(`${dir} is deleted, ready for build.`)
} catch (err) {
  console.error(`Error while deleting ${dir}.`)
}
