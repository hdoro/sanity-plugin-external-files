import { createMachine, assign } from 'xstate'
import { SanityUpload } from '../../types'

interface Context {
  allFiles?: SanityUpload[]
  filteredFiles?: SanityUpload[]
  fileToEdit?: SanityUpload
  searchTerm?: string
}

type BrowserEvent =
  // BROWSING
  | { type: 'OPEN_SETTINGS' }
  | { type: 'OPEN_UPLOAD' }
  | { type: 'EDIT_FILE'; file: SanityUpload }
  | { type: 'SEARCH_TERM'; term: string }
  // UPLOADING
  | { type: 'CLOSE_UPLOAD' }
  | { type: 'UPLOADED'; file: SanityUpload }
  // EDITING FILE (details dialog)
  | { type: 'CLEAR_FILE' }
  | { type: 'PERSIST_FILE_SAVE'; file: SanityUpload }
  | { type: 'PERSIST_FILE_DELETION'; file: SanityUpload }
  // EDITING SETTINGS DIALOG
  | { type: 'CLOSE_SETTINGS' }

const browserMachine = createMachine<Context, BrowserEvent>(
  {
    id: 'browser-machine',
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          id: 'FetchFiles',
          src: 'fetchFiles',
          onDone: {
            target: 'browsing',
            actions: [
              // console.log,
              assign({
                allFiles: (_context, event) => event.data,
                filteredFiles: (_context, event) => event.data,
              }),
            ],
          },
        },
      },
      browsing: {
        on: {
          SEARCH_TERM: {
            actions: [
              assign({
                searchTerm: (_context, event) => event.term,
              }),
              'filterFiles',
            ],
          },
          EDIT_FILE: {
            target: 'editingFile',
            actions: assign({
              fileToEdit: (_context, event) => event.file,
            }),
          },
          OPEN_UPLOAD: 'uploading',
          OPEN_SETTINGS: 'editingSettings',
        },
      },
      uploading: {
        on: {
          CLOSE_UPLOAD: 'browsing',
          UPLOADED: {
            target: 'editingFile',
            actions: [
              assign((context, event) => {
                const newFiles = [event.file, ...(context.allFiles || [])]
                return {
                  // After upload is done:
                  // 1. open the file selection dialog for this entry
                  fileToEdit: event.file,
                  // 2. Reset search
                  searchTerm: '',
                  // 3. Default to allFiles & filteredFiles
                  allFiles: newFiles,
                  filteredFiles: newFiles,
                }
              }),
            ],
          },
        },
      },
      editingFile: {
        on: {
          CLEAR_FILE: {
            target: 'browsing',
            actions: assign({
              fileToEdit: (_context) => undefined,
            }),
          },
        },
      },
      editingSettings: {
        on: {
          CLOSE_SETTINGS: {
            target: 'browsing',
          },
        },
      },
    },
    on: {
      PERSIST_FILE_SAVE: {
        actions: assign({
          allFiles: (context, event) => {
            return context.allFiles?.map((file) => {
              if (file._id === event.file?._id) {
                return event.file
              }
              return file
            })
          },
          filteredFiles: (context, event) => {
            return context.filteredFiles?.map((file) => {
              if (file._id === event.file?._id) {
                return event.file
              }
              return file
            })
          },
        }),
      },
      PERSIST_FILE_DELETION: {
        actions: assign({
          allFiles: (context, event) =>
            context.allFiles?.filter((file) => {
              if (file._id === event.file?._id) {
                return false
              }
              return true
            }),
          filteredFiles: (context, event) =>
            context.filteredFiles?.filter((file) => {
              if (file._id === event.file?._id) {
                return false
              }
              return true
            }),
        }),
      },
    },
  },
  {
    actions: {
      filterFiles: assign({
        filteredFiles: (context, event) => {
          if (event.type !== 'SEARCH_TERM' || typeof event.term !== 'string') {
            return context.filteredFiles
          }

          const filtered = (context.allFiles || []).filter(
            (file) =>
              file.fileName?.toLowerCase().includes(event.term) ||
              file.description?.toLowerCase().includes(event.term) ||
              file.title?.toLowerCase().includes(event.term),
          )
          return filtered
        },
      }),
    },
  },
)

export default browserMachine
