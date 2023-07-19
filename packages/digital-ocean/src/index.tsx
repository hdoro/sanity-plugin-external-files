import { definePlugin } from 'sanity'
import {
  StudioTool,
  ToolIcon,
  VendorConfiguration,
  createInput,
  getCustomDataSchema,
  getDimensionsSchema,
  getStoredFileSchema,
} from 'sanity-plugin-external-files'
import deleteFile from './deleteFile'
import { credentialsFields, schemaConfig } from './schema.config'
import uploadFile from './uploadFile'

const VENDOR_ID = 'digital-ocean-files'

export const digitalOceanFiles = definePlugin((userConfig?: UserConfig) => {
  const config = buildConfig(userConfig)
  return {
    name: config.schemaPrefix,
    schema: {
      types: [
        // digital-ocean-files.custom-data
        getCustomDataSchema(config, schemaConfig),
        // digital-ocean-files.dimensions
        getDimensionsSchema(config),
        // digital-ocean-files.storedFile
        getStoredFileSchema(config, schemaConfig),
        {
          name: `${config.schemaPrefix}.media`,
          title: 'Digital Ocean media',
          type: 'object',
          components: {
            input: createInput(config),
          },
          fields: [
            {
              name: 'asset',
              title: 'Asset',
              type: 'reference',
              to: [{ type: `${config.schemaPrefix}.storedFile` }],
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    },
    tools: [
      {
        name: config.schemaPrefix,
        title: config.toolTitle,
        component: () => <StudioTool {...config} />,
        icon: ToolIcon,
      },
    ],
  }
})

function buildConfig(userConfig: UserConfig = {}): VendorConfiguration {
  return {
    id: VENDOR_ID,
    customDataFieldName: 'digitalOcean',
    defaultAccept: userConfig.defaultAccept,
    schemaPrefix: userConfig.schemaPrefix || VENDOR_ID,
    toolTitle: userConfig.toolTitle ?? 'Media Library (DigitalOcean)',
    credentialsFields,
    deleteFile,
    uploadFile,
  }
}

interface UserConfig
  extends Pick<Partial<VendorConfiguration>, 'defaultAccept' | 'schemaPrefix'> {
  toolTitle?: string
}
