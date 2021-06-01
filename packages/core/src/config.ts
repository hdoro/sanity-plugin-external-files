import pluginConfig from 'config:firebase-dam'

export const DEFAULT_ACCEPT = pluginConfig?.defaultAccept || [
  'video/*',
  'audio/*',
]
