import {
  CalendarIcon,
  ClockIcon,
  DownloadIcon,
  EditIcon,
  SearchIcon,
  TrashIcon,
  CheckmarkIcon,
  RevertIcon,
  ErrorOutlineIcon,
} from '@sanity/icons'
import { TextInput } from '@sanity/ui'
import {
  Card,
  Dialog,
  Flex,
  Stack,
  Tab,
  TabList,
  TabPanel,
  useToast,
  Button,
  Text,
} from '@sanity/ui'
import { useMachine } from '@xstate/react'
import firebase from 'firebase/app'
import React from 'react'
import DefaultFormField from 'part:@sanity/components/formfields/default'

import formatBytes from '../../scripts/formatBytes'
import formatSeconds from '../../scripts/formatSeconds'
import sanityClient from '../../scripts/sanityClient'
import { SanityUpload } from '../../types'
import IconInfo from '../IconInfo'
import MediaPreview from '../MediaPreview'
import fileDetailsMachine from './fileDetailsMachine'
import FileReferences from './FileReferences'
import { Spinner } from '@sanity/ui'
import { Heading } from '@sanity/ui'

interface FileDetailsProps {
  onSelect?: (file: SanityUpload) => void
  persistFileSave: (file: SanityUpload) => void
  persistFileDeletion: (file: SanityUpload) => void
  closeDialog: () => void
  firebaseClient: firebase.app.App
  file: SanityUpload
}

const AssetInput: React.FC<{
  label: string
  description?: string
  placeholder?: string
  value: string
  onInput: (e: React.FormEvent<HTMLInputElement>) => void
}> = (props) => (
  <DefaultFormField
    label={props.label}
    description={props.description}
    level={0}
  >
    <TextInput
      value={props.value}
      placeholder={props.placeholder}
      onInput={props.onInput}
    />
  </DefaultFormField>
)

const FileDetails: React.FC<FileDetailsProps> = (props) => {
  const toast = useToast()
  const { closeDialog, firebaseClient } = props
  const [state, send] = useMachine(fileDetailsMachine, {
    actions: {
      closeDialog: () => closeDialog(),
      deletedToast: () =>
        toast.push({
          title: 'File successfully deleted',
          status: 'success',
        }),
      persistFileSave: (_context, event: any) =>
        event.data?._id && props.persistFileSave(event.data),
      persistFileDeletion: (context) =>
        context.file?._id && props.persistFileDeletion(context.file),
    },
    services: {
      deleteFile: (context) =>
        new Promise(async (res, reject) => {
          try {
            const sanityDelete = await sanityClient.delete<SanityUpload>(
              context.file?._id as string,
            )
            try {
              await firebaseClient
                .storage()
                .ref(context.file?.firebase?.fullPath)
                .delete()
              res('Success!')
            } catch (error) {
              // Before returning an error to the user, let's re-create the sanity document to prevent an unlinked reference in firebase
              await sanityClient.createOrReplace(sanityDelete)
              reject(error)
            }
          } catch (error) {
            reject(error)
          }
        }),
      saveToSanity: (context) =>
        sanityClient
          .patch(context.file?._id as string)
          .set({
            title: context.file?.title,
            description: context.file?.description,
            'firebase.name': context.file?.firebase?.name,
          })
          .commit(),
    },
    context: {
      file: props.file,
      modified: false,
    },
  })

  const file = state.context.file || props.file
  const isSaving = state.matches('interactions.saving')
  return (
    <Dialog
      header={file.title || file.firebase?.name}
      zOffset={600000}
      id="file-details-dialog"
      onClose={() => send('CLOSE')}
      onClickOutside={() => send('CLOSE')}
      width={2}
      position="fixed"
      footer={
        <Card padding={3}>
          <Flex justify="space-between" align="center">
            <Button
              icon={TrashIcon}
              fontSize={2}
              padding={3}
              mode="bleed"
              text="Delete"
              tone="critical"
              onClick={() => send('DELETE')}
              disabled={isSaving}
            />
            {state.context.modified && (
              <Button
                icon={CheckmarkIcon}
                fontSize={2}
                padding={3}
                mode="ghost"
                text="Save and close"
                tone="positive"
                onClick={() => send('SAVE')}
                iconRight={isSaving && Spinner}
                disabled={isSaving}
              />
            )}
          </Flex>
        </Card>
      }
    >
      {/* DELETION DIALOG */}
      {state.matches('interactions.deleting') && (
        <Dialog
          header={'Delete file'}
          zOffset={600000}
          id="deleting-file-details-dialog"
          onClose={() => send('CANCEL')}
          onClickOutside={() => send('CANCEL')}
          width={1}
          position="fixed"
          footer={
            <Card padding={3}>
              <Flex justify="space-between" align="center">
                <Button
                  icon={TrashIcon}
                  fontSize={2}
                  padding={3}
                  text="Delete file"
                  tone="critical"
                  onClick={() => send('CONFIRM')}
                  disabled={state.matches(
                    'interactions.deleting.processing_deletion',
                  )}
                />
              </Flex>
            </Card>
          }
        >
          <Card
            padding={5}
            style={{
              minHeight: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack style={{ textAlign: 'center' }} space={3}>
              {state.matches('interactions.deleting.confirm') && (
                <>
                  <Heading size={2}>
                    Are you sure you want to delete this file?
                  </Heading>
                  <Text size={2}>This action is irreversible</Text>
                </>
              )}
              {state.matches('interactions.deleting.processing_deletion') && (
                <>
                  <Heading size={2}>Deleting file...</Heading>
                </>
              )}
              {state.matches('interactions.deleting.error_deleting') && (
                <>
                  <Heading size={2}>Something went wrong!</Heading>
                  <Text size={2}>
                    Try deleting the file again by clicking the button below
                  </Text>
                  {state.context.file?._id && (
                    <FileReferences fileId={state.context.file._id} />
                  )}
                </>
              )}
            </Stack>
          </Card>
        </Dialog>
      )}

      {/* CONFIRM CLOSING DIALOG */}
      {state.matches('interactions.closing.confirm') && (
        <Dialog
          header={'You have unsaved changes'}
          zOffset={600000}
          id="closing-file-details-dialog"
          onClose={() => send('CANCEL')}
          onClickOutside={() => send('CANCEL')}
          width={1}
          position="fixed"
          footer={
            <Card padding={3}>
              <Flex justify="space-between" align="center">
                <Button
                  icon={ErrorOutlineIcon}
                  fontSize={2}
                  padding={3}
                  text="Discard changes"
                  tone="critical"
                  onClick={() => send('CONFIRM')}
                />
                {state.context.modified && (
                  <Button
                    icon={RevertIcon}
                    fontSize={2}
                    padding={3}
                    mode="ghost"
                    text="Keep editing"
                    tone="primary"
                    onClick={() => send('CANCEL')}
                  />
                )}
              </Flex>
            </Card>
          }
        >
          <Card padding={5}>
            <Stack style={{ textAlign: 'center' }} space={3}>
              <Heading size={2}>Unsaved changes will be lost</Heading>
              <Text size={2}>Are you sure you want to discard them?</Text>
            </Stack>
          </Card>
        </Dialog>
      )}
      <Card padding={4} sizing="border">
        <Flex sizing="border" wrap="wrap" gap={4} align="flex-start">
          <Stack space={4} flex={1} sizing="border">
            <MediaPreview context="detailsDialog" file={file} />
            <Stack space={3}>
              {file.metadata?.duration && (
                <IconInfo
                  text={`Duration: ${formatSeconds(file.metadata.duration)}`}
                  icon={ClockIcon}
                  size={2}
                />
              )}
              {file.firebase?.size && (
                <IconInfo
                  text={`Size: ${formatBytes(file.firebase.size, 2)}`}
                  icon={DownloadIcon}
                  size={2}
                />
              )}
              <IconInfo
                text={`Uploaded on: ${
                  new Date(file._createdAt).toISOString().split('T')[0]
                }`}
                icon={CalendarIcon}
                size={2}
              />
            </Stack>
          </Stack>
          <Stack space={4} flex={1} sizing="border">
            <TabList space={2}>
              <Tab
                aria-controls="details-panel"
                icon={EditIcon}
                id="details-tab"
                label="Details"
                onClick={() => send({ type: 'OPEN_DETAILS' })}
                selected={state.matches('tab.details_tab')}
                space={2}
              />
              <Tab
                aria-controls="references-panel"
                icon={SearchIcon}
                id="references-tab"
                label="Used by"
                onClick={() => send({ type: 'OPEN_REFERENCES' })}
                selected={state.matches('tab.references_tab')}
                space={2}
              />
            </TabList>
            <TabPanel
              aria-labelledby="details-tab"
              id="details-panel"
              hidden={!state.matches('tab.details_tab')}
            >
              <Stack space={3}>
                <AssetInput
                  label="Internal title"
                  description="Not visible to users. Useful for finding files later."
                  value={file?.title || ''}
                  placeholder={`Ex: "Customer testimonial ${
                    file?.firebase?.contentType?.split('/')[0] || 'video'
                  }"`}
                  onInput={(e) =>
                    send({
                      type: 'MODIFY_FILE',
                      value: e.currentTarget.value,
                      field: 'title',
                    })
                  }
                />
                <AssetInput
                  label="Internal description"
                  description="Not visible to users. Useful for finding files later."
                  value={file?.description || ''}
                  onInput={(e) =>
                    send({
                      type: 'MODIFY_FILE',
                      value: e.currentTarget.value,
                      field: 'description',
                    })
                  }
                />
                <AssetInput
                  label="File name"
                  value={file?.firebase?.name || ''}
                  onInput={(e) =>
                    send({
                      type: 'MODIFY_FILE',
                      value: e.currentTarget.value,
                      field: 'name',
                    })
                  }
                />
              </Stack>
            </TabPanel>
            <TabPanel
              aria-labelledby="references-tab"
              id="references-panel"
              hidden={!state.matches('tab.references_tab')}
            >
              <FileReferences fileId={file._id} />
            </TabPanel>
          </Stack>
        </Flex>
      </Card>
    </Dialog>
  )
}

export default FileDetails
