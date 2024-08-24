import {
    ApiIcon,
    EyeClosedIcon,
    FolderIcon,
    LockIcon,
    PinIcon,
    TrashIcon
} from '@sanity/icons'
import {
    SchemaConfigOptions,
    VendorConfiguration,
} from 'sanity-plugin-external-files'

export const schemaConfig: SchemaConfigOptions = {
    title: 'Media file hosted in Cloudflare R2 Bucket',
    customFields: ['key', 'bucket', 'region', 'originURL'],
}

export const credentialsFields: VendorConfiguration['credentialsFields'] = [
    {
        name: 'bucketName',
        title: 'Cloudflare R2 Bucket name',
        description: 'ID of the R2 (bucket) in Cloudflare',
        icon: LockIcon,
        type: 'string',
        validation: (Rule) => Rule.required(),
    },
    {
        name: 'getSignedUrlEndpoint',
        title:
            'HTTPS endpoint that returns signed URLs for uploading objects from the browser',
        icon: PinIcon,
        type: 'url',
        validation: (Rule) => Rule.required(),
    },
    {
        name: 'deleteObjectEndpoint',
        title: 'HTTPS endpoint for deleting an object in Space',
        icon: TrashIcon,
        type: 'url',
        validation: (Rule) => Rule.required(),
    },
    {
        name: 'folder',
        title: 'Folder in Cloudflare R2 Bucket',
        description:
            "Folder to store files inside the R2 Bucket. If none provided, will upload files to the R2 Bucket's root.",
        icon: FolderIcon,
        type: 'string',
    },
    {
        name: 'url',
        title: 'Public Url of the bucket. Either enable R2.dev Subdomain or configure custom domain.',
        description: "If none provided, will fallback to DigitalOcean's default",
        icon: ApiIcon,
        type: 'url',
    },
    {
        name: 'secret',
        title: 'Secret for validating the signed URL request (optional)',
        icon: EyeClosedIcon,
        type: 'string',
    },
]
