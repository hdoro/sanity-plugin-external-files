import { nanoid } from 'nanoid'
import { UploaderProps } from '../components/Uploader/Uploader'

export type GetFileRefProps = Pick<UploaderProps, 'storeOriginalFilename'> & {
  file: File
}

/**
 * Creates unique file names for uploads if storeOriginalFilename is set to false
 */
export default function getFileRef({
  storeOriginalFilename,
  file,
}: GetFileRefProps) {
  if (storeOriginalFilename) {
    // Even when using the original file name, we need to provide a unique identifier for it.
    // Else most vendors' storage offering will re-utilize the same file for 2 different uploads with the same file name, replacing the previous upload.
    return `${new Date().toISOString().replace(/\:/g, '-')}-${file.name}`
  }

  return `${new Date().toISOString().replace(/\:/g, '-')}-${nanoid(6)}.${
    file.name.split('.').slice(-1)[0]
  }`
}
