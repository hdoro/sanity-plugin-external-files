import { SanityDocument } from '@sanity/client'
import firebase from 'firebase/app'

export interface FirebaseUpload extends firebase.storage.FullMetadata {
  downloadURL: string
}

export interface SanityUpload extends SanityDocument {
  _type: 'firebase.storedFile'
  screenshot?: {
    _type: 'image'
    asset: {
      _type: 'reference'
      _ref: string
    }
  }
  firebase: FirebaseUpload
  title?: string
  description?: string
  metadata?: FileMetadata
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
