import pluginConfig from 'config:firebase-dam'
import { VendorConfiguration } from 'sanity-plugin-external-dam/lib/types'

export const DEFAULT_ACCEPT = pluginConfig?.defaultAccept || [
  'video/*',
  'audio/*',
]

const config: VendorConfiguration = {
  name: 'firebase-dam',
  defaultAccept: DEFAULT_ACCEPT,
}

export default config
