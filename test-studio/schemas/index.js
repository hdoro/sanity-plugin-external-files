const testSchema = {
  name: 'testSchema',
  title: 'Test schema',
  type: 'document',
  fields: [
    {
      name: 'rootLevel',
      title: 'Uploader in root',
      type: 'digital-ocean-files.media',
    },
    {
      name: 'cloudflareR2',
      title: 'Cloudflare R2 File',
      type: 'r2-files.media',
    },
    {
      name: 'videoOnly',
      title: 'Uploader in root (video only)',
      type: 'digital-ocean-files.media',
      options: {
        // Optional: set which file types are accepted in a field
        accept: {
          'video/*': ['mp4', 'webm', 'mov'],
        },
        // Optional: obfuscate original file names
        storeOriginalFilename: false,
      },
    },
    {
      name: 's3Root',
      title: 'Root S3 file',
      type: 's3-files.media',
    },
    {
      name: 'inObject',
      type: 'object',
      fields: [
        {
          name: 'video',
          type: 'digital-ocean-files.media',
        },
      ],
    },

    {
      name: 'inArray',
      type: 'array',
      of: [
        {
          name: 'fileInArray',
          type: 'object',
          fields: [
            {
              name: 'file',
              type: 'digital-ocean-files.media',
            },
          ],
        },
      ],
    },
  ],
}

export const schemaTypes = [testSchema]
