import { definePlugin } from 'sanity'
import s3FilesCustomData from './schemas/s3-files.custom-data'
import s3FilesDimensions from './schemas/s3-files.dimensions'
import s3FilesStoredFile from './schemas/s3-files.storedFile'
import s3FilesMedia from './schemas/s3-files.media'
import S3FilesTool from './tool'

export const s3Files = definePlugin(() => {
  return {
    name: 's3-files',
    schema: {
      types: [
        s3FilesCustomData,
        s3FilesDimensions,
        s3FilesStoredFile,
        s3FilesMedia,
      ],
    },
    tools: [S3FilesTool],
  }
})
