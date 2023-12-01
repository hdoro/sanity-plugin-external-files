import { useToast } from '@sanity/ui'
import React, { PropsWithChildren } from 'react'
import { useSanityClient } from '../../scripts/sanityClient'
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

const CredentialsProvider = (
  props: PropsWithChildren<{
    vendorConfig: VendorConfiguration
  }>,
) => {
  const { vendorConfig } = props
  const cacheKey = `_${
    vendorConfig?.schemaPrefix || 'external'
  }FilesSavedCredentials`
  const documentId = `${vendorConfig?.schemaPrefix}.credentials`

  const sanityClient = useSanityClient()
  const toast = useToast()
  const [credentials, setCredentials] = React.useState<
    VendorCredentials | undefined
  >()
  const [status, setStatus] = React.useState<CredentialsStatus>('loading')

  async function saveCredentials(newCredentials: VendorCredentials) {
    ;(window as any)[cacheKey] = undefined

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
      setStatus('success')
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

    // If credentials are passed through the plugin's config, no need to store them in Sanity
    if (
      (savedCredentials &&
        vendorConfig.credentialsFields.every(
          (field) => field.name in savedCredentials,
        )) ||
      vendorConfig.credentialsFields.length === 0
    ) {
      setCredentials(savedCredentials || {})
      setStatus('success')
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
        setStatus('success')
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
