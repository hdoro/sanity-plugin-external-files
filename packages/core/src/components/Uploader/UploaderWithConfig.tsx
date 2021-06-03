import { Card, Spinner, Box } from '@sanity/ui'
import React from 'react'
import sanityClient from '../../scripts/sanityClient'
import ConfigureCredentials from '../Credentials/ConfigureCredentials'
import { CredentialsContext } from '../Credentials/CredentialsProvider'
import Uploader, { UploaderProps } from './Uploader'

export interface UploaderWithConfigProps
  extends Omit<UploaderProps, 'sanityClient'> {}

const UploaderWithConfig: React.FC<UploaderWithConfigProps> = (props) => {
  const { status } = React.useContext(CredentialsContext)

  if (status === 'missingCredentials') {
    return <ConfigureCredentials vendorConfig={props.vendorConfig} />
  }

  if (status === 'loading') {
    return (
      <Card
        border
        style={{
          paddingBottom: '56.25%',
          position: 'relative',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        >
          <Spinner />
        </Box>
      </Card>
    )
  }

  return <Uploader sanityClient={sanityClient} {...props} />
}

export default UploaderWithConfig
