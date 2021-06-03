import { getStoredFileSchema } from 'sanity-plugin-external-dam'
import config from '../config'

const S3_FIELDS = ['content_md5', 'version_id', 'key']

export default getStoredFileSchema(config, {
  title: 'Media file hosted in AWS S3',
  customFields: S3_FIELDS,
})
