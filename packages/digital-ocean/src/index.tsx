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
  const userCredentials = userConfig?.credentials || {}
  return {
    id: VENDOR_ID,
    customDataFieldName: 'digitalOcean',
    defaultAccept: userConfig.defaultAccept,
    schemaPrefix: userConfig.schemaPrefix || VENDOR_ID,
    toolTitle: userConfig.toolTitle ?? 'Media Library (DigitalOcean)',
    credentialsFields: credentialsFields.filter(
      // Credentials already provided by the
      (field) =>
        !userCredentials[field.name] && !(field.name in userCredentials),
    ),
    deleteFile: (props) =>
      deleteFile({
        ...props,
        credentials: { ...userCredentials, ...(props.credentials || {}) },
      }),
    uploadFile: (props) =>
      uploadFile({
        ...props,
        credentials: { ...userCredentials, ...(props.credentials || {}) },
      }),
  }
}

export interface DigitalOceanCredentials {
  /** ID of the Space in DigitalOcean */
  bucketKey?: string

  /** Space (bucket) region */
  bucketRegion?: string

  /** HTTPS endpoint that returns signed URLs for uploading objects from the browser */
  getSignedUrlEndpoint?: string

  /** HTTPS endpoint for deleting an object in Space */
  deleteObjectEndpoint?: string

  /** Folder to store files inside the space. If none provided, will upload files to the Space's root. */
  folder?: string

  /**
   * @optional
   * If none provided, will fallback to DigitalOcean's default
   */
  subdomain?: string

  /**
   * @optional
   * Secret for validating the signed URL request (optional)
   *
   * 🚨 Give preference to storing this value in Sanity by leaving this configuration empty.
   * When you populate it here, it'll show up in the JS bundle of the Sanity studio.
   */
  secretForValidating?: string
}

interface UserConfig
  extends Pick<Partial<VendorConfiguration>, 'defaultAccept' | 'schemaPrefix'> {
  toolTitle?: string

  /**
   * @optional
   * Credentials for accessing the DigitalOcean Space.
   *
   * Leave this empty if you don't want to store credentials in the JS bundle of the Sanity studio, and instead prefer storing them in the dataset as a private document.
   * If empty, the user will be prompted to enter credentials when they first open the media library.
   *
   * This configuration can be partial: credentials not provided here will be prompted to be stored inside of Sanity.
   * For example, you may want to store the public-facing `bucketKey` and `bucketRegion` in the JS bundle, but keep `secretForValidating` in the Sanity dataset.
   */
  credentials?: Partial<DigitalOceanCredentials>
}
