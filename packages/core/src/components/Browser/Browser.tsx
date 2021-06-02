import { SearchIcon, UploadIcon, CogIcon } from '@sanity/icons'
import {
  Button,
  Card,
  Box,
  Container,
  Dialog,
  Inline,
  Flex,
  Grid,
  Spinner,
  Stack,
  studioTheme,
  Text,
  TextInput,
  ThemeProvider,
  Tooltip,
} from '@sanity/ui'
import { useMachine } from '@xstate/react'
import React from 'react'

import parseAccept from '../../scripts/parseAccept'
import sanityClient from '../../scripts/sanityClient'
import { SanityUpload, VendorConfiguration } from '../../types'
import ConfigureCredentials from '../Credentials/ConfigureCredentials'
import { CredentialsContext } from '../Credentials/CredentialsProvider'
import Uploader, { UploaderProps } from '../Uploader/Uploader'
import browserMachine from './browserMachine'
import FileDetails from './FileDetails'
import FilePreview from './FilePreview'

interface BrowserProps {
  onSelect?: (file: SanityUpload) => void
  accept?: UploaderProps['accept']
  vendorConfig: VendorConfiguration
}

function getFilterForExtension(extension: string) {
  if (!extension) {
    return true
  }
  return `contentType match "*${extension.replace(/[\.]/g, '')}*"`
}

const Browser: React.FC<BrowserProps> = (props) => {
  const { onSelect, accept = props.vendorConfig?.defaultAccept } = props
  const [state, send] = useMachine(browserMachine, {
    services: {
      fetchFiles: () => {
        const parsedAccept = parseAccept(props.accept)
        let extensionFilter = ''
        if (typeof parsedAccept === 'string') {
          extensionFilter = `&& ${getFilterForExtension(parsedAccept)}`
        } else if (Array.isArray(parsedAccept)) {
          extensionFilter = `&& (
            ${parsedAccept.map(getFilterForExtension).join(' || ')}
            
          )`
        }
        return sanityClient.fetch(/* groq */ `
        *[
          _type == "${props.vendorConfig?.id}-dam.storedFile" &&
          defined(fileURL)
          ${extensionFilter}
        ] | order(_createdAt desc)
        `)
      },
    },
  })
  const { status } = React.useContext(CredentialsContext)

  return (
    <ThemeProvider theme={studioTheme}>
      <Flex
        direction="column"
        gap={2}
        style={{
          background: 'white',
          padding: '2rem',
          minHeight: onSelect ? '300px' : '100%',
          boxSizing: 'border-box',
        }}
      >
        {state.matches('loading') ? (
          <Flex flex={1} justify="center" align="center">
            <Spinner />
          </Flex>
        ) : status === 'missingCredentials' ? (
          <ConfigureCredentials vendorConfig={props.vendorConfig} />
        ) : (
          <Container padding={2} width={3} sizing="border-box" flex={1}>
            <Flex justify="space-between" align="center">
              <TextInput
                value={state.context.searchTerm || ''}
                icon={SearchIcon}
                onInput={(e: React.FormEvent<HTMLInputElement>) =>
                  send({
                    type: 'SEARCH_TERM',
                    term: e.currentTarget.value,
                  })
                }
                placeholder="Search files"
              />
              <Inline space={2}>
                {status === "success" && (
                  <Button
                    icon={UploadIcon}
                    mode="ghost"
                    tone="primary"
                    text="Upload new file"
                    fontSize={2}
                    onClick={() => send('OPEN_UPLOAD')}
                  />
                )}
                <Tooltip
                  content={
                    <Box padding={3}>
                      <Text>Plugin settings</Text>
                    </Box>
                  }
                >
                  <Button
                    icon={CogIcon}
                    mode="ghost"
                    tone="default"
                    fontSize={2}
                    onClick={() => send('OPEN_SETTINGS')}
                  />
                </Tooltip>
              </Inline>
            </Flex>
            {state.context.searchTerm ? (
              <Stack space={3} style={{ margin: '2rem 0 -1rem' }}>
                <Text size={3} weight="bold">
                  {state.context.filteredFiles?.length
                    ? `${state.context.filteredFiles?.length} results for "${state.context.searchTerm}"`
                    : 'No results found'}
                </Text>
                {state.context.filteredFiles?.length ? null : (
                  <Text size={2}>
                    If you can't find what you're looking for, consider
                    uploading a new file by clicking on the button on the
                    top-right.
                  </Text>
                )}
              </Stack>
            ) : !state.context.allFiles?.length ? (
              <Stack space={3} style={{ margin: '2rem 0 -1rem' }}>
                <Text size={3} weight="bold">
                  No files uploaded yet
                </Text>
              </Stack>
            ) : null}
            <Grid
              gap={4}
              style={{
                marginTop: '2rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr)',
              }}
            >
              {state.context.filteredFiles?.length
                ? state.context.filteredFiles.map((file) => (
                    <FilePreview
                      key={file._id}
                      file={file}
                      onEdit={(chosen) =>
                        send({
                          type: 'EDIT_FILE',
                          file: chosen,
                        })
                      }
                      onSelect={onSelect}
                    />
                  ))
                : null}
            </Grid>
            {state.matches('uploading') && status === "success" && (
              <Dialog
                header="Upload new file"
                zOffset={600000}
                id="upload-dialog"
                onClose={() => send('CLOSE_UPLOAD')}
                onClickOutside={() => send('CLOSE_UPLOAD')}
                width={1}
              >
                <Card padding={3}>
                  <Uploader
                    sanityClient={sanityClient}
                    accept={accept}
                    onSuccess={(document) =>
                      send({
                        type: 'UPLOADED',
                        file: document,
                      })
                    }
                    storeOriginalFilename={true}
                    vendorConfig={props.vendorConfig}
                  />
                </Card>
              </Dialog>
            )}
            {state.matches('editingFile') &&
              state.context.fileToEdit && (
                <FileDetails
                  closeDialog={() => send('CLEAR_FILE')}
                  file={state.context.fileToEdit}
                  onSelect={onSelect}
                  persistFileSave={(file) =>
                    send({
                      type: 'PERSIST_FILE_SAVE',
                      file,
                    })
                  }
                  persistFileDeletion={(file) =>
                    send({
                      type: 'PERSIST_FILE_DELETION',
                      file,
                    })
                  }
                  vendorConfig={props.vendorConfig}
                />
              )}
            {state.matches('editingSettings') && (
              <Dialog
                header="Edit settings"
                zOffset={600000}
                id="settings-dialog"
                onClose={() => send('CLOSE_SETTINGS')}
                onClickOutside={() => send('CLOSE_SETTINGS')}
                width={1}
              >
                <ConfigureCredentials
                  onCredentialsSaved={(success) =>
                    success && send('CLOSE_SETTINGS')
                  }
                  vendorConfig={props.vendorConfig}
                />
              </Dialog>
            )}
          </Container>
        )}
      </Flex>
    </ThemeProvider>
  )
}

export default Browser
