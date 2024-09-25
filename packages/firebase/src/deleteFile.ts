import { VendorConfiguration } from 'sanity-plugin-external-files'
import getFirebaseClient, { FirebaseCredentials } from './getFirebaseClient'

const deleteFile: VendorConfiguration['deleteFile'] = async ({
  storedFile,
  credentials,
}) => {
  try {
    const firebaseClient = getFirebaseClient(credentials as FirebaseCredentials)

    await firebaseClient.storage().ref(storedFile.firebase?.fullPath).delete()

    return true
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') {
      // If file not found in Firebase, we're good!
      return true
    }

    return 'Error'
  }
}

export default deleteFile
