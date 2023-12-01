import { VendorConfiguration } from 'sanity-plugin-external-files'
import getFirebaseClient, { FirebaseCredentials } from './getFirebaseClient'

const uploadFile: VendorConfiguration['uploadFile'] = ({
  credentials,
  onError,
  onSuccess,
  file,
  fileName,
  updateProgress,
}) => {
  const firebaseClient = getFirebaseClient(credentials as FirebaseCredentials)
  const ref = firebaseClient.storage().ref(fileName)
  const uploadTask = ref.put(file, {
    customMetadata: {
      uploadedFrom: 'sanity-plugin-firebase-files',
    },
  })

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = Math.ceil(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
      )

      updateProgress(progress)
    },
    (error) => {
      onError(error)
    },
    async () => {
      const downloadURL = await uploadTask.snapshot.ref.getDownloadURL()
      const metadata = await uploadTask.snapshot.ref.getMetadata()

      onSuccess({
        fileURL: downloadURL,
        firebase: {
          bucket: metadata.bucket,
          contentDisposition: metadata.contentDisposition,
          contentEncoding: metadata.contentEncoding,
          fullPath: metadata.fullPath,
          md5Hash: metadata.md5Hash,
          generation: metadata.generation,
          metageneration: metadata.metageneration,
          type: metadata.type,
        },
      })
    },
  )
  return () => {
    try {
      uploadTask.cancel()
    } catch (error) {}
  }
}

export default uploadFile
