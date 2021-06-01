import { LinkIcon, LockIcon, UploadIcon } from '@sanity/icons'
import {
  Button,
  Card,
  Heading,
  Label,
  Spinner,
  Stack,
  Text,
  TextInput,
} from '@sanity/ui'
import DefaultFormField from 'part:@sanity/components/formfields/default'
import React from 'react'

import { CredentialsContext } from './CredentialsProvider'

const ConfigureCredentials: React.FC<{
  onCredentialsSaved?: (success: boolean) => void
}> = (props) => {
  const { saveCredentials, credentials } = React.useContext(CredentialsContext)
  const [isLoading, setIsLoading] = React.useState(false)

  // Form values:
  const [storageBucket, setStorageBucket] = React.useState('')
  const [apiKey, setApiKey] = React.useState('')

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    const success = await saveCredentials({
      apiKey,
      storageBucket,
    })
    setIsLoading(false)
    if (props.onCredentialsSaved) {
      props.onCredentialsSaved(success)
    }
  }

  React.useEffect(() => {
    if (credentials?.apiKey) {
      setApiKey(credentials.apiKey)
    }
    if (credentials?.storageBucket) {
      setStorageBucket(credentials.storageBucket)
    }
  }, [])

  return (
    <Card padding={4} border>
      <Stack space={3}>
        {credentials?.apiKey ? (
          <>
            <Heading size={3}>Edit settings</Heading>
            <Text size={2}>
              Be careful when editing these changes as they can be destructive.
            </Text>
          </>
        ) : (
          <>
            <Label size={2} muted>
              Firebase media library
            </Label>
            <Heading size={3}>First time set-up</Heading>
            <Text size={2}>
              In order to communicate with Firebase to upload videos & audio,
              you’ll have to set-up credentials below:
            </Text>
          </>
        )}
        <form style={{ marginTop: '1.5rem' }} onSubmit={submitCredentials}>
          <Stack space={3}>
            <DefaultFormField label={'Storage bucket URL'} level={0}>
              <TextInput
                icon={LinkIcon}
                onInput={(e: React.FormEvent<HTMLInputElement>) =>
                  setStorageBucket(e.currentTarget.value)
                }
                value={storageBucket}
                type="text"
                disabled={isLoading}
              />
            </DefaultFormField>
            <DefaultFormField label={'API Key'} level={0}>
              <TextInput
                icon={LockIcon}
                onInput={(e: React.FormEvent<HTMLInputElement>) =>
                  setApiKey(e.currentTarget.value)
                }
                value={apiKey}
                type="text"
                disabled={isLoading}
              />
            </DefaultFormField>
            <Button
              text={
                credentials?.apiKey
                  ? 'Update credentials'
                  : 'Set-up credentials'
              }
              icon={UploadIcon}
              iconRight={isLoading && Spinner}
              tone="positive"
              fontSize={2}
              padding={3}
              type="submit"
              disabled={isLoading}
            />
          </Stack>
        </form>
      </Stack>
    </Card>
  )
}

export default ConfigureCredentials
