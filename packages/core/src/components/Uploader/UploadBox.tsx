import { CloseIcon, RestoreIcon, UploadIcon } from '@sanity/icons'
import { Button, Card, Inline, Spinner, Stack, Text } from '@sanity/ui'
import React from 'react'

import { Heading } from '@sanity/ui'
import { VendorConfiguration } from '../../types'
import { useUploadReturn } from './useUpload'

interface UploadBox extends useUploadReturn {
  onUploadClick: () => void
  vendorConfig: VendorConfiguration
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
  const uploadingStates = ['uploadingToVendor', 'uploadingToSanity']
  const loadingStates = [...metadataStates, ...uploadingStates]

  const rootProps = getRootProps()

  // By default, Sanity's dialogs will capture drag/drop events, breaking the dropzone.
  // So for UploadBox inside arrays, we need to capture these events first, hence the duplication
  // of handlers in their captured version.
  const adjustedRootProps: typeof rootProps = {
    ...rootProps,
    onDragEnterCapture: (e) => {
      rootProps.onDragEnter?.(e)
    },
    onDragLeaveCapture: (e) => {
      rootProps.onDragLeave?.(e)
    },
    onDragOverCapture: (e) => {
      rootProps.onDragOver?.(e)
    },
    onDropCapture: (e) => {
      rootProps.onDrop?.(e)
    },
  }
  return (
    <Card
      {...adjustedRootProps}
      padding={4}
      border
      display="flex"
      tone={isDragReject ? 'critical' : isDragAccept ? 'positive' : 'default'}
      style={{
        minHeight: '300px',
        borderStyle: isDragActive ? 'dashed' : 'solid',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <input
        ref={inputRef}
        id="drop-file"
        {...getInputProps()}
        disabled={!['idle', 'retry', 'failure'].includes(state.value as any)}
      />
      <Stack space={3}>
        {state.value === 'failure' && (
          <>
            <Heading size={2}>
              {state.context.error?.title || 'Failed to upload'}
            </Heading>
            {state.context.error?.subtitle && (
              <Text>{state.context.error.subtitle}</Text>
            )}
            <Inline space={2} style={{ marginTop: '0.75rem' }}>
              <Button
                icon={RestoreIcon}
                fontSize={2}
                padding={3}
                mode="ghost"
                text="Retry"
                tone="primary"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault()
                  e.stopPropagation()
                  retry()
                }}
                style={{ position: 'relative', zIndex: 20 }}
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
              {state.matches('extractingVideoMetadata') &&
                'Extracting video thumbnails'}

              {state.matches('extractingAudioMetadata') && (
                <>
                  Extracting audio's waveform
                  <div
                    style={{
                      fontWeight: 400,
                    }}
                  >
                    (may take up to 2 minutes)
                  </div>
                </>
              )}

              {state.value === 'uploadingToVendor' && 'Uploading...'}

              {state.value === 'uploadingToSanity' &&
                'Saving to the library...'}
            </Text>
            {state.value === 'uploadingToVendor' && (
              <>
                {props.vendorConfig.supportsProgress && (
                  <Text>{state.context.vendorUploadProgress}%</Text>
                )}
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
