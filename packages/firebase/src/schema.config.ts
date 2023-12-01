import { LockIcon, LinkIcon } from '@sanity/icons'
import { VendorConfiguration } from 'sanity-plugin-external-files'

export const schemaConfig = {
  title: 'Media file hosted in Firebase',
  customFields: [
    'bucket',
    'contentDisposition',
    'contentEncoding',
    'fullPath',
    'md5Hash',
    'generation',
    'metageneration',
    'type',
  ],
}

export const credentialsFields: VendorConfiguration['credentialsFields'] = [
  {
    name: 'apiKey',
    title: 'API Key',
    icon: LockIcon,
    type: 'string',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'storageBucket',
    title: 'Storage Bucket',
    icon: LinkIcon,
    type: 'string',
    validation: (Rule) => Rule.required(),
  },
]
