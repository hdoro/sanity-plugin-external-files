import React from 'react'
import { VendorConfiguration } from '../types'
import Browser from './Browser/Browser'
import CredentialsProvider from './Credentials/CredentialsProvider'

const Tool: React.FC<VendorConfiguration> = (props) => {
  return (
    <CredentialsProvider vendorConfig={props}>
      <Browser vendorConfig={props} />
    </CredentialsProvider>
  )
}

const CreateTool = (props: VendorConfiguration) => Tool(props)

export default CreateTool