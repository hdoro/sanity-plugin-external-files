import {
  SchemaConfigOptions,
  VendorConfiguration,
} from 'sanity-plugin-external-files'
import {
  LockIcon,
  PinIcon,
  TrashIcon,
  EyeClosedIcon,
  EarthGlobeIcon,
  ApiIcon,
  FolderIcon,
} from '@sanity/icons'

export const schemaConfig: SchemaConfigOptions = {
  title: 'Media file hosted in Digital Ocean Spaces',
  customFields: ['key', 'bucket', 'region', 'originURL'],
}

export const credentialsFields: VendorConfiguration['credentialsFields'] = [
  {
    name: 'bucketKey',
    title: 'Digital Ocean Space name',
    description: 'ID of the Space (bucket) in DigitalOcean',
    icon: LockIcon,
    type: 'string',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'bucketRegion',
    title: 'Space (bucket) region',
    icon: EarthGlobeIcon,
    type: 'string',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'getSignedUrlEndpoint',
    title:
      'HTTPS endpoint that returns signed URLs for uploading objects from the browser',
    icon: PinIcon,
    type: 'url',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'deleteObjectEndpoint',
    title: 'HTTPS endpoint for deleting an object in Space',
    icon: TrashIcon,
    type: 'url',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'folder',
    title: 'Folder in Space',
    description:
      "Folder to store files inside the space. If none provided, will upload files to the Space's root.",
    icon: FolderIcon,
    type: 'string',
  },
  {
    name: 'subdomain',
    title: 'Custom subdomain (optional)',
    description: "If none provided, will fallback to DigitalOcean's default",
    icon: ApiIcon,
    type: 'url',
  },
  {
    name: 'secretForValidating',
    title: 'Secret for validating the signed URL request (optional)',
    icon: EyeClosedIcon,
    type: 'string',
  },
]
