import React from 'react'
import firebase from 'firebase/app'

import getFirebaseClient from '../../scripts/getFirebaseClient'
import { CredentialsContext, CredentialsStatus } from './CredentialsProvider'

const useVendorClient = (): {
  status: CredentialsStatus
  vendorClient?: firebase.app.App
} => {
  const [firebaseClient, setFirebaseClient] = React.useState<firebase.app.App>()
  const { credentials, status } = React.useContext(CredentialsContext)

  React.useEffect(() => {
    if (credentials?.apiKey && credentials?.storageBucket) {
      setFirebaseClient(
        getFirebaseClient({
          apiKey: credentials.apiKey,
          storageBucket: credentials.storageBucket,
        }),
      )
    }
  }, [credentials])

  return {
    status,
    vendorClient: firebaseClient,
  }
}

export default useVendorClient
