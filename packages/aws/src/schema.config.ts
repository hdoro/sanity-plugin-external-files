import {
  LockIcon,
  PinIcon,
  TrashIcon,
  EyeClosedIcon,
  EarthGlobeIcon,
} from '@sanity/icons'
import { VendorConfiguration } from 'sanity-plugin-external-files'

export const schemaConfig = {
  title: 'Media file hosted in AWS S3',
  customFields: ['key', 'bucket', 'region'],
}

export const credentialsFields: VendorConfiguration['credentialsFields'] = [
  {
    name: 'bucketKey',
    title: 'S3 bucket key',
    icon: LockIcon,
    type: 'string',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'bucketRegion',
    title: 'S3 bucket region',
    icon: EarthGlobeIcon,
    type: 'string',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'getSignedUrlEndpoint',
    title: "Endpoint for getting S3's signed URL",
    icon: PinIcon,
    type: 'url',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'deleteObjectEndpoint',
    title: 'Endpoint for deleting an object in S3',
    icon: TrashIcon,
    type: 'url',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'secretForValidating',
    title: 'Secret for validating the signed URL request (optional)',
    icon: EyeClosedIcon,
    type: 'string',
  },
]
