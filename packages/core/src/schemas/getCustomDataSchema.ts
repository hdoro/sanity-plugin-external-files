import { SchemaType } from '@sanity/types'
import { VendorConfiguration } from '../types'

type CustomField = string | SchemaType

interface SchemaConfigOptions {
  title?: string
  customFields?: CustomField[]
}

export const getCustomDataFieldKey = (vendorConfig: VendorConfiguration) =>
  vendorConfig.customDataFieldName || vendorConfig.id.replace(/-/g, '_')

export const getCustomDataTypeKey = (vendorConfig: VendorConfiguration) =>
  `${vendorConfig.id}.custom-data`

const getCustomDataSchema = (
  vendorConfig: VendorConfiguration,
  schemaConfig: SchemaConfigOptions = {},
) => ({
  name: getCustomDataTypeKey(vendorConfig),
  title: `${vendorConfig.id}-exclusive fields`,
  options: { collapsible: true, collapsed: false },
  type: 'object',
  fields: (schemaConfig?.customFields || []).map((field) => {
    if (typeof field === 'string') {
      return {
        name: field,
        type: 'string',
      }
    }
    return field
  }),
})

export default getCustomDataSchema
