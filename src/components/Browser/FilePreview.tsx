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
      <Stack
        space={3}
        height="fill"
        style={{
          gridTemplateRows: 'min-content min-content 1fr',
        }}
      >
        <MediaPreview file={file} context="browser" />
        <Stack space={2}>
          <Stack space={2}>
            <Text size={1} weight="bold" muted>
              {file.title || file.firebase?.name}
            </Text>
            {file.description && (
              <p
                style={
                  {
                    fontFamily: 'inherit',
                    margin: 0,
                    fontSize: '0.8125rem',
                    lineHeight: '1.0625rem',
                    color: 'var(--card-muted-fg-color)',
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    overflow: 'hidden',
                  } as React.CSSProperties
                }
              >
                {file.description}
              </p>
            )}
          </Stack>
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
        <div
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            gap: '.35rem',
          }}
        >
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
        </div>
      </Stack>
    </Card>
  )
}

export default FilePreview
