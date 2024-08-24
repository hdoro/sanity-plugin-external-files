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

const VENDOR_ID = 'cloudflare-r2'

export const cloudflareR2Files = definePlugin((userConfig?: UserConfig) => {
    const config = buildConfig(userConfig)
    return {
        name: config.schemaPrefix,
        schema: {
            types: [
                // cloudflare-r2-files.custom-data
                getCustomDataSchema(config, schemaConfig),
                // cloudflare-r2-files.dimensions
                getDimensionsSchema(config),
                // cloudflare-r2-files.storedFile
                getStoredFileSchema(config, schemaConfig),
                {
                    name: `${config.schemaPrefix}.media`,
                    title: 'Cloudflare R2 Media',
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
        customDataFieldName: 'cloudflareR2',
        defaultAccept: userConfig.defaultAccept,
        schemaPrefix: userConfig.schemaPrefix || VENDOR_ID,
        toolTitle: userConfig.toolTitle ?? 'Media Library (Cloudflare R2)',
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

export interface CloudflareR2Credentials {
    /** 
     * ## `bucketName`
     * - ID of the R2 Bucket in Cloudflare 
     * - Example: `sanity-media`
     */
    bucketName?: string

    /** 
     * ## `getSignedUrlEndpoint`
     * - HTTPS endpoint that returns signed URLs for uploading objects from the browser 
     * - Example:
     */
    getSignedUrlEndpoint?: string

    /**
     * ## `deleteObjectEndpoint`
     * - HTTPS endpoint for deleting an object in R2 Bucket 
     * - Example: 
     */
    deleteObjectEndpoint?: string

    /** 
     * ## `url`
     * - Public url of the bucket. Either enable R2.dev Subdomain or configure Cloudflare Custom Public Domain. 
     * - Example: `https://pub-<random>.r2.dev`
     */
    url?: string


    /** 
     * ## `folder`
     * @optional 
     * - Folder to store files inside the R2 Bucket. If none provided, will upload files to the R2 Bucket's root. 
     * - Example: `images`, `videos`, `documents`, etc.
     */
    folder?: string

    /**
     * ## `secret`
     * @optional
     * Secret for validating the signed URL request (optional)
     * Must be kept private and not shared with anyone.
     * Must be passed to the server for validating the signed URL request, e. g. the Cloudflare Worker.
     *
     * 🚨 Give preference to storing this value in Sanity by leaving this configuration empty.
     * When you populate it here, it'll show up in the JS bundle of the Sanity studio.
     */
    secret?: string
}

interface UserConfig
    extends Pick<Partial<VendorConfiguration>, 'defaultAccept' | 'schemaPrefix'> {
    toolTitle?: string

    /**
     * @optional
     * Credentials for accessing the Cloudflare R2 Bucekt.
     *
     * Leave this empty if you don't want to store credentials in the JS bundle of the Sanity studio, and instead prefer storing them in the dataset as a private document.
     * If empty, the user will be prompted to enter credentials when they first open the media library.
     *
     * This configuration can be partial: credentials not provided here will be prompted to be stored inside of Sanity.
     * For example, you may want to store the public-facing `bucketName` in the JS bundle, but keep `secret` in the Sanity dataset.
     */
    credentials?: Partial<CloudflareR2Credentials>
}
