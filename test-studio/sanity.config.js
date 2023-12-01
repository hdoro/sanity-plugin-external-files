import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {digitalOceanFiles} from 'sanity-plugin-digital-ocean-files'
import {deskTool} from 'sanity/desk'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Test studio',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,

  plugins: [
    deskTool(),
    visionTool(),
    digitalOceanFiles({
      toolTitle: 'Media Library',
      // If you want to restrict file types library-wide:
      // defaultAccept: {
      //   'application/pdf': ['pdf'],
      //   'video/*': ['mp4', 'mov', 'webm'],
      // },
      credentials: {
        bucketKey: process.env.SANITY_STUDIO_BUCKET_KEY,
        bucketRegion: process.env.SANITY_STUDIO_BUCKET_REGION,
        getSignedUrlEndpoint: process.env.SANITY_STUDIO_SIGNED_URL_ENDPOINT,
        deleteObjectEndpoint: process.env.SANITY_STUDIO_DELETE_OBJECT_ENDPOINT,
        folder: process.env.SANITY_STUDIO_UPLOAD_FOLDER,
        subdomain: null,
        secretForValidating: null,
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
