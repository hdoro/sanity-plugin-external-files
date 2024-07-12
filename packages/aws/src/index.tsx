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

export const s3Files: any = definePlugin((userConfig?: UserConfig) => {
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
  const userCredentials = userConfig?.credentials || {}

  return {
    id: VENDOR_ID,
    customDataFieldName: 's3',
    defaultAccept: userConfig.defaultAccept,
    schemaPrefix: userConfig.schemaPrefix || VENDOR_ID,
    toolTitle: userConfig.toolTitle ?? 'Media Library (S3)',
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

interface UserConfig
  extends Pick<Partial<VendorConfiguration>, 'defaultAccept' | 'schemaPrefix'> {
  toolTitle?: string
  /**
   * @optional
   * Credentials for accessing the S3 bucket.
   *
   * Leave this empty if you don't want to store credentials in the JS bundle of the Sanity studio, and instead prefer storing them in the dataset as a private document.
   * If empty, the user will be prompted to enter credentials when they first open the media library.
   *
   * This configuration can be partial: credentials not provided here will be prompted to be stored inside of Sanity.
   * For example, you may want to store the public-facing `bucketKey` and `bucketRegion` in the JS bundle, but keep `secretForValidating` in the Sanity dataset.
   */
  credentials?: Partial<S3Credentials>
}

export interface S3Credentials {
  /** S3 bucket key */
  bucketKey?: string

  /** S3 bucket region */
  bucketRegion?: string

  /** HTTPS endpoint that returns S3's signed URLs for uploading objects from the browser */
  getSignedUrlEndpoint?: string

  /** HTTPS endpoint for deleting an object in S3 */
  deleteObjectEndpoint?: string

  /**
   * @optional
   * Folder to store files inside the bucket. If none provided, will upload files to the bucket's root.
   */
  folder?: string

  /**
   * @optional
   * Secret for validating the signed URL request (optional)
   *
   * 🚨 Give preference to storing this value in Sanity by leaving this configuration empty.
   * When you populate it here, it'll show up in the JS bundle of the Sanity studio.
   */
  secretForValidating?: string
}
