import firebase from 'firebase/app'
import 'firebase/storage'

export interface FirebaseCredentials {
  apiKey: string
  storageBucket: string
}

function getFirebaseClient({ apiKey, storageBucket }: FirebaseCredentials) {
  const appName = `${apiKey}-${storageBucket}`
  try {
    firebase.initializeApp(
      {
        apiKey,
        storageBucket,
      },
      appName,
    )
  } catch (error) {
    // console.info('Skipped Firebase initialization error - already initialized')
  }

  return firebase.app(appName)
}

export default getFirebaseClient
