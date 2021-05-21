import React from 'react'
import firebase from 'firebase/app'
import { SanityDocument } from '@sanity/client'

import getFirebaseClient from './getFirebaseClient'
import sanityClient from './sanityClient'

interface Credentials extends SanityDocument {
  apiKey: string
  storageBucket: string
}

const CREDENTIALS_QUERY = '*[_id == "firebase.credentials"][0]'

const useFirebaseClient = (): {
  missingCredentials?: boolean
  firebaseClient?: firebase.app.App
} => {
  const [firebaseClient, setFirebaseClient] = React.useState<firebase.app.App>()
  const [credentials, setCredentials] = React.useState<Credentials>()
  const [missingCredentials, setMissingCredentials] = React.useState<boolean>()

  React.useEffect(() => {
    sanityClient
      .fetch<Credentials>(CREDENTIALS_QUERY)
      .then((doc) => {
        if (!doc?.apiKey || !doc?.storageBucket) {
          setMissingCredentials(true)
          return
        }
        setCredentials(doc)
      })
      .catch(() => setMissingCredentials(true))

    const subscription = sanityClient
      .listen<Credentials>(CREDENTIALS_QUERY)
      .subscribe((update) => {
        if (update.result?.apiKey && update.result?.storageBucket) {
          setCredentials(update.result)
          setMissingCredentials(false)
        }
      })
    return () => {
      subscription.unsubscribe
    }
  }, [])

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
    missingCredentials,
    firebaseClient,
  }
}

export default useFirebaseClient
