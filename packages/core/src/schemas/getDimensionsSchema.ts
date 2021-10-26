import { VendorConfiguration } from '../types'

const getDimensionsSchema = (vendorConfig: VendorConfiguration) => ({
  name: `${vendorConfig.id}.dimensions`,
  title: `${vendorConfig.toolTitle || vendorConfig.id} dimensions`,
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
