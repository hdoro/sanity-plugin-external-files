import React from 'react'
import Browser from './Browser/Browser'
import CredentialsProvider from './Credentials/CredentialsProvider'

const Tool: React.FC = () => {
  return (
    <CredentialsProvider>
      <Browser />
    </CredentialsProvider>
  )
}

export default Tool
