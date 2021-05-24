import { Card, Spinner, Box } from '@sanity/ui'
import React from 'react'
import sanityClient from '../../scripts/sanityClient'
import useVendorClient from '../Credentials/useVendorClient'
import ConfigureCredentials from '../Credentials/ConfigureCredentials'
import Uploader, { UploaderProps } from './Uploader'

export interface UploaderWithConfigProps
  extends Omit<UploaderProps, 'vendorClient' | 'sanityClient'> {}

const UploaderWithConfig: React.FC<UploaderWithConfigProps> = (props) => {
  const { vendorClient, status } = useVendorClient()

  if (status === 'missingCredentials') {
    return <ConfigureCredentials />
  }

  if (status === 'loading' || !vendorClient) {
    return (
      <Card
        border
        style={{
          paddingBottom: '56.25%',
          position: 'relative'
        }}
      >
        <Box style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%,-50%)'
        }}>
          <Spinner />
        </Box>
      </Card>
    )
  }

  return (
    <Uploader
      sanityClient={sanityClient}
      vendorClient={vendorClient}
      {...props}
    />
  )
}

export default UploaderWithConfig
