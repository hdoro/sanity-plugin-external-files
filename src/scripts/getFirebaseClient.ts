import firebase from 'firebase/app'
import 'firebase/storage'

export interface FirebaseCredentials {
  apiKey: string
  storageBucket: string
}

function getFirebaseClient({ apiKey, storageBucket }: FirebaseCredentials) {
  try {
    firebase.initializeApp(
      {
        apiKey,
        storageBucket,
      },
      apiKey,
    )
  } catch (error) {
    // console.info('Skipped Firebase initialization error - already initialized')
  }

  return firebase.app(apiKey)
}

export default getFirebaseClient
