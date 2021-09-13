import React from 'react'
import { useToast } from '@sanity/ui'

import sanityClient from '../../scripts/sanityClient'
import { VendorConfiguration, VendorCredentials } from '../../types'

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

interface CredentialsProviderProps {
  vendorConfig: VendorConfiguration
}

const CredentialsProvider: React.FC<CredentialsProviderProps> = (props) => {
  const { vendorConfig } = props
  const cacheKey = `_${vendorConfig?.id || 'external'}DamSavedCredentials`
  const documentId = `${vendorConfig.id}.credentials`

  const toast = useToast()
  const [credentials, setCredentials] =
    React.useState<VendorCredentials | undefined>()
  const [status, setStatus] = React.useState<CredentialsStatus>('loading')

  async function saveCredentials(newCredentials: VendorCredentials) {
    ;(window as any)[cacheKey] = undefined

    // If one credential is missing in newCredentials, error out
    if (
      vendorConfig.credentialsFields.some(
        (field) => !(field.name in newCredentials),
      )
    ) {
      toast.push({
        title: 'Missing credentials',
        status: 'error',
      })
      return false
    }

    try {
      await sanityClient.createOrReplace({
        _id: documentId,
        _type: documentId,
        ...newCredentials,
      })
      toast.push({
        title: 'Credentials successfully saved!',
        status: 'success',
      })
      setCredentials(newCredentials)
      setStatus("success")
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
      ;(window as any)[cacheKey] = credentials
      setStatus('success')
    }
  }, [credentials])

  React.useEffect(() => {
    // Credentials stored in the window object to spare extra API calls
    const savedCredentials: VendorCredentials | undefined = (window as any)[
      cacheKey
    ]
    if (
      savedCredentials &&
      vendorConfig.credentialsFields.every(
        (field) => field.name in savedCredentials,
      )
    ) {
      setCredentials(savedCredentials)
      setStatus("success")
      return
    }

    sanityClient
      .fetch<VendorCredentials>(`*[_id == "${documentId}"][0]`)
      .then((doc) => {
        if (!doc) {
          setStatus('missingCredentials')
          return
        }
        setCredentials(doc)
        setStatus("success")
      })
      .catch(() => setStatus('missingCredentials'))
  }, [vendorConfig])

  return (
    <CredentialsContext.Provider
      value={{ credentials, saveCredentials, status }}
    >
      {props.children}
    </CredentialsContext.Provider>
  )
}

export default CredentialsProvider
