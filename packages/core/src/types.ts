import type { Accept } from 'react-dropzone'
import type { SanityDocument, BaseSchemaType } from 'sanity'

type StrictSanityDocument = Pick<
  SanityDocument,
  '_id' | '_rev' | '_type' | '_createdAt' | '_updatedAt'
>

export interface VendorCredentials extends Partial<SanityDocument> {
  [credentialKey: string]: any
}

/**
 * Use this return to cancel your upload, clean observables, etc.
 */
type CleanUpUpload = () => void

export interface AcceptedCredentialField extends Omit<BaseSchemaType, 'type'> {
  type: 'string' | 'number' | 'url'
}

/**
 * Necessary to initialize the input & tool on different vendors
 */
export interface VendorConfiguration {
  id: string
  customDataFieldName?: string
  toolTitle?: string
  supportsProgress?: boolean

  /**
   * Which files to accept in all instances of this media library, by default.
   *
   * Can be overwritten on a per-field basis.
   */
  defaultAccept?: Accept

  /**
   * What prefix to use for the plugin's schema.
   *
   * Schema types added by the plugin:
   * - `${PREFIX}.storedFile` - the file stored. Analogous to Sanity's `sanity.imageAsset`.
   * - `${PREFIX}.media` - the field for the user to select a file. Analogous to Sanity's `image` field.
   * - `${PREFIX}.dimensions` and `${PREFIX}.custom-data` - internal schemas used by `${PREFIX}.storedFile` to ensure full GraphQL compatibility.
   *
   * @default `${plugin.id}` // e.g. `firebase-files`, `s3-files`, `digital-ocean-files`
   */
  schemaPrefix: string

  /**
   * This plugin currently treats all fields as required
   */
  credentialsFields: AcceptedCredentialField[]

  /**
   * Should return true if file successfully deleted or string with error code / name if failed to delete.
   */
  deleteFile: (props: {
    storedFile: SanityUpload
    credentials: VendorCredentials
  }) => Promise<true | string>
  /**
   * Function to upload file to
   */
  uploadFile: (props: {
    file: File
    /**
     * File name you should use for storage.
     * Use this instead of file.name as it respects users' storeOriginalFilename options.
     */
    fileName: string
    /**
     * Credentials as configured by your plugin.
     */
    credentials: VendorCredentials
    /**
     * Inform users about the progress of the upload
     */
    updateProgress: (progress: number) => void
    /**
     * Call this function if upload fails to update the UI
     */
    onError: (error?: Error) => void
    /**
     * Should return a VendorUpload object with data we can populate the SanityUpload document with
     */
    onSuccess: (uploadedFile: VendorUpload) => void
  }) => CleanUpUpload | undefined
}

export interface VendorUpload {
  fileURL?: string
  [vendorId: string]: any
}

export interface SanityUpload
  extends StrictSanityDocument,
    Partial<AudioMetadata>,
    Partial<VideoMetadata>,
    VendorUpload {
  _type: string
  fileName?: string
  contentType?: string
  fileSize?: number
  /**
   * Exclusive to videos
   */
  screenshot?: {
    _type: 'image'
    asset: {
      _type: 'reference'
      _ref: string
    }
  }
  title?: string
  description?: string
}

export interface AssetReference {
  asset: {
    _type: 'reference'
    _ref: string
  }
}

export type MediaFile = SanityUpload | AssetReference

export interface AudioMetadata {
  /**
   * Duration in seconds
   */
  duration: number
  waveformData?: number[]
}

interface VideoMetadata {
  /**
   * Duration in seconds
   */
  duration: number
  /**
   * Dimensions in pixels
   */
  dimensions: {
    width: number
    height: number
  }
}

export type FileMetadata = AudioMetadata | VideoMetadata

export interface ExternalFileFieldOptions {
  accept?: Accept
  storeOriginalFilename?: boolean
}
