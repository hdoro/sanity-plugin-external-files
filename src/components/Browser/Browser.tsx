import React from 'react'
import {
  studioTheme,
  ThemeProvider,
  Container,
  Card,
  Button,
  Grid,
  Flex,
  Dialog,
  TextInput,
  Text,
  Spinner,
  Stack,
} from '@sanity/ui'
import { UploadIcon, SearchIcon } from '@sanity/icons'
import { useMachine } from '@xstate/react'

import useFirebaseClient from '../../scripts/useFirebaseClient'
import browserMachine from './browserMachine'
import { SanityUpload } from '../../types'
import FilePreview from './FilePreview'
import FileDetails from './FileDetails'
import sanityClient from '../../scripts/sanityClient'
import parseAccept from '../../scripts/parseAccept'
import Uploader, { UploaderProps } from '../Uploader/Uploader'

interface BrowserProps {
  onSelect?: (file: SanityUpload) => void
  accept?: UploaderProps['accept']
}

function getFilterForExtension(extension: string) {
  if (!extension) {
    return true
  }
  return `firebase.contentType match "*${extension.replace(/[\.]/g, '')}*"`
}

const Browser: React.FC<BrowserProps> = (props) => {
  const { onSelect, accept = ['video/*', 'audio/*'] } = props
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
          _type == "firebase.storedFile" &&
          defined(firebase.downloadURL)
          ${extensionFilter}
        ] | order(_createdAt desc)
        `)
      },
    },
  })
  const { firebaseClient } = useFirebaseClient()

  return (
    <ThemeProvider theme={studioTheme}>
      <Flex
        direction="column"
        gap={2}
        style={{ background: 'white', padding: '2rem', minHeight: '300px' }}
      >
        {state.matches('loading') ? (
          <Flex flex={1} justify="center" align="center">
            <Spinner />
          </Flex>
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
              {firebaseClient && (
                <Button
                  icon={UploadIcon}
                  mode="ghost"
                  tone="primary"
                  text="Upload new file"
                  fontSize={2}
                  onClick={() => send('OPEN_UPLOAD')}
                />
              )}
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
            {state.matches('uploading') && firebaseClient && (
              <Dialog
                header="Upload new file"
                zOffset={600000}
                id="upload-dialog"
                onClose={() => send('CLOSE_UPLOAD')}
                width={1}
              >
                <Card padding={3}>
                  <Uploader
                    firebaseClient={firebaseClient}
                    sanityClient={sanityClient}
                    accept={accept}
                    onSuccess={(document) =>
                      send({
                        type: 'UPLOADED',
                        file: document,
                      })
                    }
                    storeOriginalFilename={true}
                  />
                </Card>
              </Dialog>
            )}
            {state.matches('editingFile') &&
              state.context.fileToEdit &&
              firebaseClient && (
                <FileDetails
                  firebaseClient={firebaseClient}
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
                />
              )}
          </Container>
        )}
      </Flex>
    </ThemeProvider>
  )
}

export default Browser
