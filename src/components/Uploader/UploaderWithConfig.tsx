import { Card, Spinner } from '@sanity/ui'
import React from 'react'
import sanityClient from '../../scripts/sanityClient'
import useFirebaseClient from '../../scripts/useFirebaseClient'
import ConfigureCredentials from './ConfigureCredentials'
import Uploader, { UploaderProps } from './Uploader'


export interface UploaderWithConfigProps
  extends Omit<UploaderProps, 'firebaseClient' | 'sanityClient'> {}

const UploaderWithConfig: React.FC<UploaderWithConfigProps> = (props) => {
  const { firebaseClient, missingCredentials } = useFirebaseClient()

  if (missingCredentials) {
    return (
      <ConfigureCredentials />
    )
  }
  
  if (!firebaseClient) {
    return (
      <Card style={{
        paddingBottom: '56.25%',
      }}>
        <Spinner />
      </Card>
    )
  }

  return (
    <Uploader
      sanityClient={sanityClient}
      firebaseClient={firebaseClient}
      {...props}
    />
  )
}

export default UploaderWithConfig
