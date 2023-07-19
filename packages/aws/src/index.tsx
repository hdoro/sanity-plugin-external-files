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

const VENDOR_ID = 's3-files'

export const s3Files = definePlugin((userConfig?: UserConfig) => {
  const config = buildConfig(userConfig)

  return {
    name: config.schemaPrefix,
    schema: {
      types: [
        // s3-files.custom-data
        getCustomDataSchema(config, schemaConfig),
        // s3-files.dimensions
        getDimensionsSchema(config),
        // s3-files.storedFile
        getStoredFileSchema(config, schemaConfig),
        {
          name: `${config.schemaPrefix}.media`,
          title: 'S3 media',
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
    customDataFieldName: 's3',
    defaultAccept: userConfig.defaultAccept,
    schemaPrefix: userConfig.schemaPrefix || VENDOR_ID,
    toolTitle: userConfig.toolTitle ?? 'Media Library (S3)',
    credentialsFields,
    deleteFile: deleteFile,
    uploadFile: uploadFile,
  }
}

interface UserConfig
  extends Pick<Partial<VendorConfiguration>, 'defaultAccept' | 'schemaPrefix'> {
  toolTitle?: string
}
