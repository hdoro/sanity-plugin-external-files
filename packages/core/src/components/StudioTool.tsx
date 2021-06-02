import React from 'react'
import { VendorConfiguration } from '../types'
import Browser from './Browser/Browser'
import CredentialsProvider from './Credentials/CredentialsProvider'

const StudioTool: React.FC<VendorConfiguration> = (props) => {
  return (
    <CredentialsProvider vendorConfig={props}>
      <Browser vendorConfig={props} />
    </CredentialsProvider>
  )
}

export default StudioTool
