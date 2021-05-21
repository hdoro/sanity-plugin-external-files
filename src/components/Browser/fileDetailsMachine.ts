import { createMachine, assign } from 'xstate'
import { SanityDocument } from '@sanity/client'
import { SanityUpload } from '../../types'

interface Context {
  file?: SanityUpload
  references?: SanityDocument[]
  modified: boolean
}

type FileDetailsEvent =
  // TAB EVENTS
  | { type: 'OPEN_REFERENCES' }
  | { type: 'OPEN_DETAILS' }
  | {
      type: 'MODIFY_FILE'
      field: 'title' | 'description' | 'name'
      value: string
    }
  // ACTIONS
  | { type: 'DELETE' }
  | { type: 'SAVE' }
  | { type: 'CLOSE' }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL' }

const fileDetailsMachine = createMachine<Context, FileDetailsEvent>(
  {
    id: 'file-details',
    context: {
      modified: false,
    },
    type: 'parallel',
    states: {
      tab: {
        initial: 'details_tab',
        states: {
          details_tab: {
            on: {
              OPEN_REFERENCES: 'references_tab',
              MODIFY_FILE: {
                actions: [
                  'modifyFile',
                  assign({
                    modified: (_context) => true,
                  }),
                ],
              },
            },
          },
          references_tab: {
            // invoke: {
            //   id: 'FetchReferences',
            //   src: 'fetchReferences',
            //   onDone: {
            //     actions: assign({
            //       references: (_context, event) => event.data,
            //     }),
            //   },
            // },
            on: {
              OPEN_DETAILS: 'details_tab',
            },
          },
        },
      },
      interactions: {
        initial: 'idle',
        states: {
          idle: {},
          deleting: {
            initial: 'confirm',
            states: {
              confirm: {
                on: {
                  CONFIRM: 'processing_deletion',
                },
              },
              processing_deletion: {
                invoke: {
                  id: 'DeleteFile',
                  src: 'deleteFile',
                  onDone: {
                    target: 'deleted',
                    actions: 'persistFileDeletion',
                  },
                  onError: {
                    target: 'error_deleting',
                    actions: [console.log],
                  },
                },
              },
              deleted: {
                type: 'final',
              },
              error_deleting: {
                on: {
                  CONFIRM: 'processing_deletion',
                },
              },
            },
            on: {
              CANCEL: {
                target: 'idle',
                cond: (_context, _event, { state }) =>
                  !state.matches('interactions.deleting.processing_deletion'),
              },
            },
            onDone: {
              actions: ['deletedToast', 'closeDialog'],
            },
          },
          saving: {
            invoke: {
              id: 'SaveToSanity',
              src: 'saveToSanity',
              onDone: {
                target: 'closing.closed',
                actions: 'persistFileSave',
              },
            },
          },
          closing: {
            initial: 'confirm',
            states: {
              confirm: {
                on: {
                  '': [
                    {
                      target: 'closed',
                      cond: (context) => !context.modified,
                    },
                  ],
                  CONFIRM: 'closed',
                },
              },
              closed: {
                type: 'final',
              },
            },
            on: {
              CANCEL: 'idle',
            },
            onDone: {
              actions: 'closeDialog',
            },
          },
        },
        on: {
          DELETE: 'interactions.deleting',
          CLOSE: {
            target: 'interactions.closing',
            cond: (_context, _event, { state }) =>
              !state.matches('interactions.saving') &&
              !state.matches('interactions.deleting'),
          },
          SAVE: [
            {
              target: 'interactions.saving',
              // Needs to be modified to be saved
              cond: (context) => context.modified,
            },
          ],
        },
      },
    },
  },
  {
    actions: {
      modifyFile: assign({
        file: (context, event) => {
          if (event.type !== 'MODIFY_FILE' || !context.file) {
            return context.file
          }
          const newFile: SanityUpload = JSON.parse(JSON.stringify(context.file))
          if (event.field === 'title') {
            newFile.title = event.value
          }
          if (event.field === 'description') {
            newFile.description = event.value
          }
          if (event.field === 'name') {
            newFile.firebase.name = event.value
          }
          return newFile
        },
      }),
    },
  },
)

export default fileDetailsMachine
