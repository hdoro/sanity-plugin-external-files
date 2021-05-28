const FIELDS = [
  'downloadURL',
  'bucket',
  'contentDisposition',
  'contentEncoding',
  'contentType',
  'fullPath',
  'md5Hash',
  'generation',
  'metageneration',
  'type',
  'name',
  { name: 'updated', type: 'datetime' },
  { name: 'timeCreated', type: 'datetime' },
  { name: 'size', type: 'number' },
]

export default {
  name: 'firebase.storedFile',
  title: 'Media file hosted in Firebase',
  type: 'document',
  fields: [
    {
      name: 'screenshot',
      title: 'Video screenshot',
      type: 'image',
    },
    {
      name: 'title',
      title: 'Title',
      description: 'Mainly for internal reference',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      description: 'Mainly for internal reference',
      type: 'text',
    },
    {
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        {
          name: 'duration',
          title: 'Duration (in seconds)',
          type: 'number',
        },
        {
          name: 'dimensions',
          title: 'Dimensions',
          description: 'Exclusive to videos',
          type: 'object',
          fields: [
            {
              name: 'width',
              type: 'number',
            },
            {
              name: 'height',
              type: 'number',
            },
          ],
        },
        {
          name: 'waveformData',
          title: 'Waveform peak data',
          description: 'Exclusive to audio files',
          type: 'array',
          of: [{ type: 'number' }],
        },
      ],
    },
    {
      name: 'firebase',
      title: 'Firebase information',
      options: { collapsible: true, collapsed: false },
      type: 'object',
      fields: [
        ...FIELDS.map((field) => {
          if (typeof field === 'string') {
            return {
              name: field,
              type: 'string',
            }
          }
          return field
        }),
        {
          name: 'customMetadata',
          title: 'Custom metadata',
          type: 'object',
          fields: [
            {
              name: 'uploadedFrom',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      fileName: 'firebase.name',
      description: 'description',
      downloadURL: 'firebase.downloadURL',
      media: 'screenshot',
    },
    prepare: ({ media, downloadURL, fileName, title, description }: any) => {
      return {
        title: title || fileName || 'Untitled file',
        subtitle: description || downloadURL,
        media,
      }
    },
  },
}
