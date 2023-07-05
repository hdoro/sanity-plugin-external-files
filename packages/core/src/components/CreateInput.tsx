import React from 'react'
import { ObjectInputProps, set, unset } from 'sanity'
import { SanityUpload, VendorConfiguration } from '../types'
import { useCallback, useState } from 'react'
import CredentialsProvider from './Credentials/CredentialsProvider'
import { Dialog, studioTheme, ThemeProvider } from '@sanity/ui'
import { createPortal } from 'react-dom'
import Browser from './Browser/Browser'
import UploaderWithConfig from './Uploader/UploaderWithConfig'

/**
 * Lets editors choose assets from external DAM inside the document editor.
 */
export default function createInput(vendorConfig: VendorConfiguration) {
  return function ExternalDamInput(props: ObjectInputProps<SanityUpload>) {
    const { onChange, value, schemaType } = props
    const {
      accept = vendorConfig?.defaultAccept,
      storeOriginalFilename = true,
    } = schemaType?.options || {}

    const [browserOpen, setBrowserOpen] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<SanityUpload | undefined>()

    const updateValue = useCallback(
      (document: SanityUpload) => {
        const patchValue = {
          _type: schemaType.name,
          asset: {
            _type: 'reference',
            _ref: document._id,
          },
        }
        onChange(set(patchValue))
        setBrowserOpen(false)
        setUploadedFile(document)
      },
      [onChange, setBrowserOpen, setUploadedFile, schemaType],
    )

    const removeFile = useCallback(() => {
      onChange(unset())
      setUploadedFile(undefined)
    }, [onChange, setUploadedFile])

    const toggleBrowser = useCallback(() => {
      setBrowserOpen((prev) => !prev)
    }, [setBrowserOpen])

    return (
      <CredentialsProvider vendorConfig={vendorConfig}>
        <ThemeProvider theme={studioTheme}>
          <UploaderWithConfig
            accept={accept}
            storeOriginalFilename={storeOriginalFilename}
            onSuccess={updateValue}
            chosenFile={uploadedFile || value}
            removeFile={removeFile}
            openBrowser={toggleBrowser}
            vendorConfig={vendorConfig}
          />
          {browserOpen &&
            createPortal(
              <Dialog
                header="Select File"
                zOffset={600000}
                id="file-browser"
                onClose={toggleBrowser}
                onClickOutside={toggleBrowser}
                width={5}
                position="fixed"
                style={{
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  padding: '0 1rem',
                  boxSizing: 'border-box',
                }}
              >
                <Browser
                  vendorConfig={vendorConfig}
                  onSelect={updateValue}
                  accept={accept}
                />
              </Dialog>,
              document.getElementsByTagName('body')[0],
            )}
        </ThemeProvider>
      </CredentialsProvider>
    )
  }
}
