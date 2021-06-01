import React from 'react'
import { Text, Inline } from '@sanity/ui'

const IconInfo: React.FC<{ text: string; icon: React.FC; size?: number }> = (
  props,
) => {
  const Icon = props.icon
  return (
    <Inline space={1}>
      <Icon />
      <Text size={props.size || 1}>{props.text}</Text>
    </Inline>
  )
}

export default IconInfo
