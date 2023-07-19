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

export const s3Files = definePlugin((userConfig?: UserConfig) => {
  const config = buildConfig(userConfig)

  return {
    name: 's3-files',
    schema: {
      types: [
        // s3-files.custom-data
        getCustomDataSchema(config, schemaConfig),
        // s3-files.dimensions
        getDimensionsSchema(config),
        // s3-files.storedFile
        getStoredFileSchema(config, schemaConfig),
        {
          name: 's3-files.media',
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
              // @TODO: how to handle schema/id changes?
              to: [{ type: 's3-files.storedFile' }],
            },
          ],
        },
      ],
    },
    tools: [
      {
        name: 's3-files',
        title: config.toolTitle,
        component: () => <StudioTool {...config} />,
        icon: ToolIcon,
      },
    ],
  }
})

interface UserConfig {
  toolTitle?: string
  defaultAccept?: VendorConfiguration['defaultAccept']
}

function buildConfig(userConfig: UserConfig = {}): VendorConfiguration {
  return {
    id: 's3-files',
    customDataFieldName: 's3',
    defaultAccept: userConfig.defaultAccept,
    toolTitle: userConfig.toolTitle ?? 'Media Library (S3)',
    credentialsFields,
    deleteFile: deleteFile,
    uploadFile: uploadFile,
  }
}
