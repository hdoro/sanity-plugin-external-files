import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {cloudflareR2Files} from 'sanity-plugin-r2-files'
import {digitalOceanFiles} from 'sanity-plugin-digital-ocean-files'
import {s3Files} from 'sanity-plugin-s3-files'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Test studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,

  plugins: [
    structureTool(),
    visionTool(),
    cloudflareR2Files({
      toolTitle: 'Cloudflare R2',
      credentials: {
        url: process.env.SANITY_STUDIO_CF_URL,
        workerUrl: process.env.SANITY_STUDIO_CF_WORKER_URL,
      },
    }),
    digitalOceanFiles({
      toolTitle: 'Digital Ocean',
      // If you want to restrict file types library-wide:
      // defaultAccept: {
      //   'application/pdf': ['pdf'],
      //   'video/*': ['mp4', 'mov', 'webm'],
      // },
      credentials: {
        bucketKey: process.env.SANITY_STUDIO_DO_BUCKET_KEY,
        bucketRegion: process.env.SANITY_STUDIO_DO_BUCKET_REGION,
        getSignedUrlEndpoint: process.env.SANITY_STUDIO_DO_SIGNED_URL_ENDPOINT,
        deleteObjectEndpoint: process.env.SANITY_STUDIO_DO_DELETE_OBJECT_ENDPOINT,
        folder: process.env.SANITY_STUDIO_DO_UPLOAD_FOLDER,
        subdomain: null,
        secretForValidating: null,
      },
    }),
    s3Files({
      toolTitle: 'S3',
      // If you want to restrict file types library-wide:
      // defaultAccept: {
      //   '*': ['*'],
      // },
      credentials: {
        bucketKey: process.env.SANITY_STUDIO_S3_BUCKET_KEY,
        bucketRegion: process.env.SANITY_STUDIO_S3_BUCKET_REGION,
        getSignedUrlEndpoint: process.env.SANITY_STUDIO_S3_SIGNED_URL_ENDPOINT,
        deleteObjectEndpoint: process.env.SANITY_STUDIO_S3_DELETE_OBJECT_ENDPOINT,
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
