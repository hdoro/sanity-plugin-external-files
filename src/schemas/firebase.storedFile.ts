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
      title: 'firebase.name',
      subtitle: 'firebase.downloadURL',
      media: 'screenshot',
    },
  },
}
