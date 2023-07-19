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

export const firebaseFiles = definePlugin((userConfig?: UserConfig) => {
  const config = buildConfig(userConfig)
  return {
    name: 'firebase-files',
    schema: {
      types: [
        // firebase-files.custom-data
        getCustomDataSchema(config, schemaConfig),
        // firebase-files.dimensions
        getDimensionsSchema(config),
        // firebase-files.storedFile
        getStoredFileSchema(config, schemaConfig),
        {
          // @TODO: how to handle schema/id changes?
          name: 'firebase-files.media',
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
              // @TODO: how to handle schema/id changes?
              to: [{ type: 'firebase-files.storedFile' }],
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
    },
    tools: [
      {
        name: 'firebase-files',
        title: config.toolTitle,
        component: () => <StudioTool {...config} />,
        icon: ToolIcon,
      },
    ],
  }
})

function buildConfig(userConfig: UserConfig = {}): VendorConfiguration {
  return {
    id: 'firebase-files',
    customDataFieldName: 'firebase',
    defaultAccept: userConfig.defaultAccept,
    toolTitle: userConfig.toolTitle ?? 'Media Library (Firebase)',
    credentialsFields,
    deleteFile: deleteFile,
    uploadFile: uploadFile,
  }
}

interface UserConfig {
  toolTitle?: string
  defaultAccept?: VendorConfiguration['defaultAccept']
}
