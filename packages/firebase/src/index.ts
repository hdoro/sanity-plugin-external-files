import { definePlugin } from 'sanity'
import firebaseFilesCustomData from './schemas/firebase-files.custom-data'
import firebaseFilesDimensions from './schemas/firebase-files.dimensions'
import firebaseFilesStoredFile from './schemas/firebase-files.storedFile'
import firebaseFilesMedia from './schemas/firebase-files.media'
import FirebaseFilesTool from './tool'

export const firebaseFiles = definePlugin(() => {
  return {
    name: 'firebase-files',
    schema: {
      types: [
        firebaseFilesCustomData,
        firebaseFilesDimensions,
        firebaseFilesStoredFile,
        firebaseFilesMedia,
      ],
    },
    tools: [FirebaseFilesTool],
  }
})
