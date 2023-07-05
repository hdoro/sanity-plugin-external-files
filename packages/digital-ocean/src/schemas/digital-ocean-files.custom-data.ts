import { getCustomDataSchema } from 'sanity-plugin-external-files'
import config from '../config'
import schemaConfig from '../schema.config'

export default getCustomDataSchema(config, schemaConfig)
