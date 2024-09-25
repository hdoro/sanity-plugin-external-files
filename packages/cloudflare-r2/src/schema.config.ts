import {
    ApiIcon,
    EyeClosedIcon,
    FolderIcon,
    PinIcon
} from '@sanity/icons'
import {
    SchemaConfigOptions,
    VendorConfiguration,
} from 'sanity-plugin-external-files'

export const schemaConfig: SchemaConfigOptions = {
    title: 'Media file hosted in Cloudflare R2 Bucket',
    customFields: ['fileKey', 'baseUrl'],
}

export const credentialsFields: VendorConfiguration['credentialsFields'] = [
    {
        name: 'workerUrl',
        title: 'Cloudflare Worker URL',
        description:
            'URL of the Cloudflare Worker that handles the signed URL requests for uploading files to the R2 Bucket.',
        icon: PinIcon,
        type: 'url',
        validation: (Rule) => Rule.required(),
    },
    {
        name: 'folder',
        title: 'Folder',
        description:
            "Folder to store files inside the R2 Bucket. If none provided, will upload files to the R2 Bucket's root. Creates one if it doesn't exist.",
        icon: FolderIcon,
        type: 'string',
    },
    {
        name: 'url',
        title: 'Public URL',
        description: 'Public Url of the bucket. Either enable R2.dev Subdomain or configure custom domain.',
        icon: ApiIcon,
        type: 'url',
    },
    {
        name: 'secret',
        title: 'Secret',
        description: 'Secret for validating the signed URL request (optional)',
        icon: EyeClosedIcon,
        type: 'string',
    },
]
