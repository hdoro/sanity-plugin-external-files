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
  useToast,
} from '@sanity/ui'
import DefaultFormField from 'part:@sanity/components/formfields/default'
import React from 'react'

import sanityClient from '../../scripts/sanityClient'

const ConfigureCredentials: React.FC = () => {
  const toast = useToast()
  const [storageBucket, setStorageBucket] = React.useState('')
  const [apiKey, setApiKey] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    if (!storageBucket || !apiKey) {
      toast.push({
        title: 'Missing credentials',
        status: 'error',
      })
      return
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
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      toast.push({
        title: "Couldn't create credentials",
        status: 'error',
      })
    }
  }

  return (
    <Card padding={4} border>
      <Stack space={3}>
        <Label size={2} muted>
          Firebase media library
        </Label>
        <Heading size={3}>First time set-up</Heading>
        <Text size={2}>
          In order to communicate with Firebase to upload videos & audio, you’ll
          have to set-up credentials below:
        </Text>
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
              text="Set-up credentials"
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
