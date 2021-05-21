import React from 'react'
import { Button, Card, Inline, Stack, Text, Spinner } from '@sanity/ui'
import { gray, red, green } from '@sanity/color'
import { UploadIcon, CloseIcon, RestoreIcon } from '@sanity/icons'

import { useUploadReturn } from './useUpload'

interface UploadBox extends useUploadReturn {
  onUploadClick: () => void
}

const UploadBox: React.FC<UploadBox> = (props) => {
  const { dropzone, state, cancelUpload, retry, onUploadClick } = props
  const {
    inputRef,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = dropzone

  const metadataStates = ['extractingVideoMetadata', 'extractingAudioMetadata']
  const uploadingStates = ['uploadingToFirebase', 'uploadingToSanity']
  const loadingStates = [...metadataStates, ...uploadingStates]

  return (
    <Card
      padding={4}
      border
      display="flex"
      {...getRootProps()}
      style={{
        minHeight: '300px',
        borderStyle: isDragActive ? 'dashed' : 'solid',
        background: isDragReject
          ? red[50].hex
          : isDragAccept
          ? green[50].hex
          : gray[100].hex,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <input
        ref={inputRef}
        id="drop-file"
        {...getInputProps()}
        disabled={!['idle', 'retry'].includes(state.value as any)}
      />
      <Stack space={3}>
        {state.value === 'failure' && (
          <>
            <Text weight="bold" muted>
              Failed to upload
            </Text>
            <Inline space={2}>
              <Button
                icon={RestoreIcon}
                fontSize={2}
                padding={3}
                mode="ghost"
                text="Retry"
                tone="primary"
                onClick={retry}
              />
              <Button
                icon={UploadIcon}
                fontSize={2}
                padding={3}
                mode="ghost"
                text="Upload another file"
                onClick={onUploadClick}
              />
            </Inline>
          </>
        )}
        {state.value === 'success' && (
          <Text weight="bold" muted>
            Success!
          </Text>
        )}
        {state.value === 'idle' && (
          <>
            {!isDragActive && (
              <UploadIcon style={{ margin: '0 auto' }} fontSize={40} />
            )}
            <Text weight="bold" muted={isDragActive}>
              {isDragActive ? 'Drop to upload' : 'Drag file or click here'}
            </Text>
          </>
        )}
        {loadingStates.find(state.matches) && (
          <>
            <Spinner />
            <Text weight="bold" muted>
              {metadataStates.find(state.matches) && 'Parsing file'}

              {state.value === 'uploadingToFirebase' && 'Uploading...'}

              {state.value === 'uploadingToSanity' &&
                'Saving to the library...'}
            </Text>
            {state.value === 'uploadingToFirebase' && (
              <>
                <Text>{state.context.firebaseUploadProgress}%</Text>
                <Button
                  icon={CloseIcon}
                  fontSize={2}
                  padding={3}
                  mode="ghost"
                  text="Cancel"
                  tone="critical"
                  style={{ flex: 1 }}
                  onClick={cancelUpload}
                />
              </>
            )}
          </>
        )}
      </Stack>
    </Card>
  )
}

export default UploadBox
