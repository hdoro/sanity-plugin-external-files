import { SchemaType } from '@sanity/types'
import { VendorConfiguration } from '../types'
import { getCustomDataFieldKey, getCustomDataTypeKey } from './getCustomDataSchema'
import getDimensionsSchema from './getDimensionsSchema'

type CustomField = string | SchemaType

interface SchemaConfigOptions {
  title?: string
  customFields?: CustomField[]
}

const getStoredFileSchema = (
  vendorConfig: VendorConfiguration,
  schemaConfig: SchemaConfigOptions = {},
) => ({
  name: `${vendorConfig.id}.storedFile`,
  title: schemaConfig.title || 'Media file hosted in external vendor',
  type: 'document',
  fieldsets: [
    {
      name: 'audio',
      title: 'Audio-exclusive fields',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'video',
      title: 'Video-exclusive fields',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
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
      name: 'fileName',
      title: 'File name',
      type: 'string',
    },
    {
      name: 'fileURL',
      title: 'File URL / download URL',
      type: 'string',
    },
    {
      name: 'contentType',
      title: 'Content Type',
      description: 'MIME type',
      type: 'string',
    },
    {
      name: 'duration',
      title: 'Duration (in seconds)',
      type: 'number',
    },
    {
      name: 'fileSize',
      title: 'Size in bytes',
      type: 'number',
    },
    {
      name: 'screenshot',
      title: 'Video screenshot',
      type: 'image',
      fieldset: 'video',
    },
    {
      name: 'dimensions',
      title: 'Dimensions',
      type: getDimensionsSchema(vendorConfig).name,
      fieldset: 'video',
    },
    {
      name: 'waveformData',
      title: 'Waveform peak data',
      description: 'Exclusive to audio files',
      fieldset: 'audio',
      type: 'array',
      of: [{ type: 'number' }],
    },
    ...(schemaConfig?.customFields
      ? [
          {
            name: getCustomDataFieldKey(vendorConfig),
            title: `${vendorConfig.id}-exclusive fields`,
            options: { collapsible: true, collapsed: false },
            type: getCustomDataTypeKey(vendorConfig),
          },
        ]
      : []),
  ],
  preview: {
    select: {
      title: 'title',
      fileName: 'fileName',
      description: 'description',
      assetURL: 'assetURL',
      media: 'screenshot',
    },
    prepare: ({ media, assetURL, fileName, title, description }: any) => {
      return {
        title: title || fileName || 'Untitled file',
        subtitle: description || assetURL,
        media,
      }
    },
  },
})

export default getStoredFileSchema
