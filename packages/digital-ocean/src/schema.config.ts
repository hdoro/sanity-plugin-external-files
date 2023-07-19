import { VendorConfiguration } from 'sanity-plugin-external-files'
import {
  LockIcon,
  PinIcon,
  TrashIcon,
  EyeClosedIcon,
  EarthGlobeIcon,
  ApiIcon,
} from '@sanity/icons'

export const schemaConfig = {
  title: 'Media file hosted in Digital Ocean Spaces',
  customFields: ['key', 'bucket', 'region', 'originURL'],
}

export const credentialsFields: VendorConfiguration['credentialsFields'] = [
  {
    name: 'bucketKey',
    title: 'Digital Ocean Space name',
    description: 'This corresponds to the id of the bucket',
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
    title: "Endpoint for getting Space's signed URL",
    icon: PinIcon,
    type: 'url',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'deleteObjectEndpoint',
    title: 'Endpoint for deleting an object in Space',
    icon: TrashIcon,
    type: 'url',
    validation: (Rule) => Rule.required(),
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
