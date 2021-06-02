import mime from 'mime'

import { UploaderProps } from '../components/Uploader/Uploader'

export function parseExtension(extension: string) {
  return mime.getType(extension) || extension
}

/**
 * Converts user input on `accept` (.mp4, audio/*, etc.) into MIME types we can then use in Browser & in useUpload to filter/accept only those files matching the desired extensions.
 * This is especially handy for extensions where their MIME type doesn't include their extension, such as .m4a -> audio/mp4.
 */
export default function parseAccept(
  accept: UploaderProps['accept'],
): UploaderProps['accept'] {
  if (typeof accept === 'string') {
    return parseExtension(accept) || undefined
  }
  if (Array.isArray(accept)) {
    return accept.map(parseExtension).filter(Boolean) as string[]
  }
  return accept
}
