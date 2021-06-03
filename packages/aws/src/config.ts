import pluginConfig from 'config:s3-dam'
import { VendorConfiguration } from 'sanity-plugin-external-dam/lib/types'
import { LockIcon, LinkIcon } from '@sanity/icons'

export const DEFAULT_ACCEPT = pluginConfig?.defaultAccept || [
  'video/*',
  'audio/*',
]

const config: VendorConfiguration = {
  id: 's3',
  defaultAccept: DEFAULT_ACCEPT,
  credentialsFields: [
    {
      name: 'apiKey',
      title: 'API Key',
      icon: LockIcon,
      type: 'string',
    },
    {
      name: 'storageBucket',
      title: 'Storage Bucket',
      icon: LinkIcon,
      type: 'string',
    },
  ],
  deleteFile: async ({ storedFile, credentials }) => {
    // @TODO
    return "error"
  },
  uploadFile: ({
    credentials,
    onError,
    onSuccess,
    file,
    fileName,
    updateProgress,
  }) => {
    // TODO
    return () => {
      try {
        // Cancel
      } catch (error) {}
    }
  },
}

export default config
