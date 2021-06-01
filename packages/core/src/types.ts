import { SanityDocument } from '@sanity/client'

/**
 * Necessary to initialize the input & tool on different vendors
 */
export interface VendorConfiguration {
  name: string
  defaultAccept: string | string[]
}

export interface VendorUpload {
  fileName?: string
  assetURL?: string
  contentType?: string
  size?: number
}

export interface SanityUpload
  extends SanityDocument,
    Partial<AudioMetadata>,
    Partial<VideoMetadata>,
    VendorUpload {
  _type: 'firebase.storedFile'
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
