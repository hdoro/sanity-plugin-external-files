import React from 'react'
import { Card, Button, Stack } from '@sanity/ui'
import { CheckmarkIcon, EditIcon } from '@sanity/icons'

import MediaPreview from '../MediaPreview'
import { SanityUpload } from '../../types'
import FileMetadata from '../FileMetadata'

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
        <FileMetadata file={file} />
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
