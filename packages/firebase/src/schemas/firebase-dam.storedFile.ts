import { getStoredFileSchema } from 'sanity-plugin-external-dam'
import config from '../config'

const FIREBASE_FIELDS = [
  'bucket',
  'contentDisposition',
  'contentEncoding',
  'fullPath',
  'md5Hash',
  'generation',
  'metageneration',
  'type',
]

export default getStoredFileSchema(config, {
  title: 'Media file hosted in Firebase',
  customFields: FIREBASE_FIELDS,
})
