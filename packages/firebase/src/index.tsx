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

const VENDOR_ID = 'firebase-files'

export const firebaseFiles = definePlugin((userConfig?: UserConfig) => {
  const config = buildConfig(userConfig)
  return {
    name: config.schemaPrefix,
    schema: {
      types: [
        // firebase-files.custom-data
        getCustomDataSchema(config, schemaConfig),
        // firebase-files.dimensions
        getDimensionsSchema(config),
        // firebase-files.storedFile
        getStoredFileSchema(config, schemaConfig),
        {
          name: `${config.schemaPrefix}.media`,
          title: 'Firebase media',
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
    customDataFieldName: 'firebase',
    defaultAccept: userConfig.defaultAccept,
    schemaPrefix: userConfig.schemaPrefix ?? VENDOR_ID,
    toolTitle: userConfig.toolTitle ?? 'Media Library (Firebase)',
    credentialsFields,
    deleteFile: deleteFile,
    uploadFile: uploadFile,
  }
}

interface UserConfig
  extends Pick<Partial<VendorConfiguration>, 'defaultAccept' | 'schemaPrefix'> {
  toolTitle?: string
}
