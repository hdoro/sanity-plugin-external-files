import { VendorConfiguration } from '../types'

const getDimensionsSchema = (vendorConfig: VendorConfiguration) => ({
  name: `${vendorConfig.schemaPrefix}.dimensions`,
  title: `${vendorConfig.toolTitle || vendorConfig.schemaPrefix} dimensions`,
  type: 'object',
  fields: [
    {
      name: 'width',
      type: 'number',
    },
    {
      name: 'height',
      type: 'number',
    },
  ],
})

export default getDimensionsSchema
