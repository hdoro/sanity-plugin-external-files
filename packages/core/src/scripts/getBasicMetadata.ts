import type { SanityUpload } from '../types'
import getFileRef, { type GetFileRefProps } from './getFileRef'
import { parseExtension } from './parseAccept'

export default function getBasicFileMetadata(
  props: GetFileRefProps,
): Pick<SanityUpload, 'fileSize' | 'contentType' | 'fileName'> {
  return {
    fileSize: props.file.size,
    contentType: parseExtension(props.file.type),
    fileName: getFileRef(props),
  }
}
