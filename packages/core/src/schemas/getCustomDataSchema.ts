import { SchemaConfigOptions, VendorConfiguration } from '../types'

export const getCustomDataFieldKey = (vendorConfig: VendorConfiguration) =>
  vendorConfig.customDataFieldName ||
  vendorConfig.schemaPrefix.replace(/-/g, '_')

export const getCustomDataTypeKey = (vendorConfig: VendorConfiguration) =>
  `${vendorConfig.schemaPrefix}.custom-data`

const getCustomDataSchema = (
  vendorConfig: VendorConfiguration,
  schemaConfig: SchemaConfigOptions = {},
) => ({
  name: getCustomDataTypeKey(vendorConfig),
  title: `${vendorConfig.schemaPrefix}-exclusive fields`,
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
