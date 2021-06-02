import React from 'react'
import ReactDOM from 'react-dom'
import { Dialog, studioTheme, ThemeProvider } from '@sanity/ui'
import DefaultFormField from 'part:@sanity/components/formfields/default'
import { ChangeIndicatorCompareValueProvider } from '@sanity/base/lib/change-indicators/ChangeIndicator'
import { withDocument, withValuePath } from 'part:@sanity/form-builder'
import PatchEvent, { set, unset } from 'part:@sanity/form-builder/patch-event'

import UploaderWithConfig from './Uploader/UploaderWithConfig'
import Browser from './Browser/Browser'
import { AssetReference, SanityUpload, VendorConfiguration } from '../types'
import CredentialsProvider from './Credentials/CredentialsProvider'

export interface InputProps {}

const createPatchFrom = (value?: any) =>
  PatchEvent.from(value ? set(value) : unset())

/**
 * Custom slug component for better UX & safer slugs:
 * - shows the final URL for the relative address (adds the BASE.PATH/ at the start)
 * - removes special characters and startin/trailing slashes
 */
class ExternalDamInput extends React.Component<
  {
    compareValue?: AssetReference
    value?: AssetReference
    type?: any
    onChange?: any
    level?: any
    markers?: any
    presence?: any
    vendorConfig: VendorConfiguration
  },
  {
    uploadedFile?: SanityUpload
    browserOpen: boolean
  }
> {
  inputRef: React.RefObject<any>

  constructor(props: any) {
    super(props)
    this.inputRef = React.createRef()
    this.state = {
      browserOpen: false,
    }
  }

  focus = () => {
    if (this.inputRef && this.inputRef.current) {
      this.inputRef.current.focus()
    }
  }

  updateValue = (document: SanityUpload) => {
    const patchValue = {
      _type: this.props.type?.name,
      asset: {
        _type: 'reference',
        _ref: document._id,
      },
    }
    this.props.onChange(createPatchFrom(patchValue))
    this.setState({
      uploadedFile: document,
      browserOpen: false,
    })
  }

  removeFile = () => {
    this.props.onChange(createPatchFrom())
    this.setState({
      uploadedFile: undefined,
    })
  }

  toggleBrowser = () => {
    this.setState({
      browserOpen: !this.state.browserOpen,
    })
  }

  render() {
    const { value, type, vendorConfig } = this.props
    const {
      accept = vendorConfig?.defaultAccept,
      storeOriginalFilename = true,
    } = type?.options || {}

    return (
      <CredentialsProvider vendorConfig={vendorConfig}>
        <ThemeProvider theme={studioTheme}>
          <ChangeIndicatorCompareValueProvider
            value={value?.asset?._ref}
            compareValue={this.props.compareValue?.asset?._ref}
          >
            <DefaultFormField
              label={type.title || type.name}
              description={type.description}
              level={this.props.level}
              // Necessary for validation warnings to show up contextually
              markers={this.props.markers}
              // Necessary for presence indication
              presence={this.props.presence}
            >
              <UploaderWithConfig
                accept={accept}
                storeOriginalFilename={storeOriginalFilename}
                onSuccess={this.updateValue}
                chosenFile={this.state.uploadedFile || value}
                removeFile={this.removeFile}
                openBrowser={this.toggleBrowser}
                vendorConfig={vendorConfig}
              />
            </DefaultFormField>
          </ChangeIndicatorCompareValueProvider>
          {this.state.browserOpen &&
            ReactDOM.createPortal(
              <Dialog
                header="Select File"
                zOffset={600000}
                id="file-browser"
                onClose={this.toggleBrowser}
                onClickOutside={this.toggleBrowser}
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
                  onSelect={this.updateValue}
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

// Adapted from Sanity's official withDocument implementation
const withVendorConfig = (
  ComposedComponent: any,
  vendorConfig: VendorConfiguration,
) => {
  return class WithDocument extends React.PureComponent {
    _input: any

    constructor(props: any) {
      super(props)
    }

    setInput = (input: any) => {
      this._input = input
    }

    render() {
      return (
        <ComposedComponent
          ref={this.setInput}
          {...this.props}
          vendorConfig={vendorConfig}
        />
      )
    }
  }
}

const CreateInput = (vendorConfig: VendorConfiguration) =>
  withVendorConfig(
    withValuePath(withDocument(ExternalDamInput)),
    vendorConfig,
  )

export default CreateInput
