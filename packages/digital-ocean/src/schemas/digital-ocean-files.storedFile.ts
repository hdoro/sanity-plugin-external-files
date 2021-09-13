import { getStoredFileSchema } from 'sanity-plugin-external-dam'
import config from '../config'

const DO_FIELDS = ['key', 'bucket', 'region', 'originURL']

export default getStoredFileSchema(config, {
  title: 'Media file hosted in Digital Ocean Spaces',
  customFields: DO_FIELDS,
})
