import React from 'react'
import { Card, Button, Text, Stack, Inline } from '@sanity/ui'
import {
  CheckmarkIcon,
  EditIcon,
  DownloadIcon,
  CalendarIcon,
  ClockIcon,
} from '@sanity/icons'

import MediaPreview from '../MediaPreview'
import { SanityUpload } from '../../types'
import formatSeconds from '../../scripts/formatSeconds'
import formatBytes from '../../scripts/formatBytes'
import IconInfo from '../IconInfo'

interface FilePreviewProps {
  onSelect?: (file: SanityUpload) => void
  onEdit?: (file: SanityUpload) => void
  file: SanityUpload
}

const FilePreview: React.FC<FilePreviewProps> = ({
  onSelect,
  onEdit,
  file,
}) => {
  const select = React.useCallback(
    () => onSelect && onSelect(file),
    [onSelect, file],
  )
  const edit = React.useCallback(() => onEdit && onEdit(file), [onEdit, file])
  if (!file) {
    return null
  }
  return (
    <Card border padding={2} sizing="border-box" radius={2}>
      <Stack space={3} height="fill">
        <MediaPreview file={file} context="browser" />
        <Stack space={2} flex={1}>
          <Text size={1} weight="bold" muted>
            {file.title || file.firebase?.name}
          </Text>
          {file.description && (
            <Text size={1} muted>
              {file.description}
            </Text>
          )}
          <Inline space={3}>
            {file.metadata?.duration && (
              <IconInfo
                text={formatSeconds(file.metadata.duration)}
                icon={ClockIcon}
              />
            )}
            {file.firebase?.size && (
              <IconInfo
                text={formatBytes(file.firebase.size)}
                icon={DownloadIcon}
              />
            )}
            <IconInfo
              text={new Date(file._createdAt).toISOString().split('T')[0]}
              icon={CalendarIcon}
            />
          </Inline>
        </Stack>
        <Inline space={2} width="fill">
          {onSelect && (
            <Button
              icon={CheckmarkIcon}
              fontSize={2}
              padding={2}
              mode="ghost"
              text="Select"
              style={{ flex: 1 }}
              tone="positive"
              onClick={select}
            />
          )}
          <Button
            icon={EditIcon}
            fontSize={2}
            padding={2}
            mode="ghost"
            text="Details"
            style={{ flex: 1 }}
            onClick={edit}
          />
        </Inline>
      </Stack>
    </Card>
  )
}

export default FilePreview
