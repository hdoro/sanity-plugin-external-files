import React from 'react'
import { SanityDocument } from '@sanity/client'
import { useToast } from '@sanity/ui'

import sanityClient from '../../scripts/sanityClient'
import { VendorConfiguration } from '../../types'

export interface VendorCredentials extends Partial<SanityDocument> {
  apiKey: string
  storageBucket: string
}

export type CredentialsStatus = 'loading' | 'missingCredentials' | 'success'

interface ContextValue {
  credentials?: VendorCredentials
  saveCredentials: (credentials: VendorCredentials) => Promise<boolean>
  status: CredentialsStatus
}

export const CredentialsContext = React.createContext<ContextValue>({
  saveCredentials: async () => false,
  status: 'loading',
})

const CREDENTIALS_QUERY = '*[_id == "firebase.credentials"][0]'

interface CredentialsProviderProps {
  vendorConfig: VendorConfiguration
}

const CredentialsProvider: React.FC<CredentialsProviderProps> = (props) => {
  const toast = useToast()
  const [credentials, setCredentials] =
    React.useState<VendorCredentials | undefined>()
  const [status, setStatus] = React.useState<CredentialsStatus>('loading')

  async function saveCredentials(newCredentials: VendorCredentials) {
    const { storageBucket, apiKey } = newCredentials || {}
    ;(window as any)._firebaseDamSavedCredentials = undefined

    if (!storageBucket || !apiKey) {
      toast.push({
        title: 'Missing credentials',
        status: 'error',
      })
      return false
    }

    try {
      await sanityClient.createOrReplace({
        _id: 'firebase.credentials',
        _type: 'firebase.credentials',
        apiKey,
        storageBucket,
      })
      toast.push({
        title: 'Credentials successfully saved!',
        status: 'success',
      })
      setCredentials(newCredentials)
      return true
    } catch (error) {
      toast.push({
        title: "Couldn't create credentials",
        status: 'error',
      })
      return false
    }
  }

  React.useEffect(() => {
    if (credentials?.apiKey && credentials?.storageBucket) {
      ;(window as any)._firebaseDamSavedCredentials = credentials
      setStatus('success')
    }
  }, [credentials])

  React.useEffect(() => {
    // Credentials stored in the window object to spare extra API calls
    const savedCredentials: VendorCredentials | undefined = (window as any)
      ._firebaseDamSavedCredentials
    if (
      typeof savedCredentials?.apiKey === 'string' &&
      typeof savedCredentials?.storageBucket === 'string'
    ) {
      setCredentials(savedCredentials)
      return
    }

    sanityClient
      .fetch<VendorCredentials>(CREDENTIALS_QUERY)
      .then((doc) => {
        if (!doc?.apiKey || !doc?.storageBucket) {
          setStatus('missingCredentials')
          return
        }
        setCredentials(doc)
      })
      .catch(() => setStatus('missingCredentials'))
  }, [])

  return (
    <CredentialsContext.Provider
      value={{ credentials, saveCredentials, status }}
    >
      {props.children}
    </CredentialsContext.Provider>
  )
}

export default CredentialsProvider
