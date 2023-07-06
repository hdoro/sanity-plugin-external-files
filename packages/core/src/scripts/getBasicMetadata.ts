import mime from 'mime'
import type { SanityUpload } from '../types'
import getFileRef, { type GetFileRefProps } from './getFileRef'

export function parseExtension(extension: string) {
  return mime.getType(extension) || extension
}

export default function getBasicFileMetadata(
  props: GetFileRefProps,
): Pick<SanityUpload, 'fileSize' | 'contentType' | 'fileName'> {
  return {
    fileSize: props.file.size,
    contentType: parseExtension(props.file.type),
    fileName: getFileRef(props),
  }
}
