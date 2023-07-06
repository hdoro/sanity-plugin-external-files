import { definePlugin } from 'sanity'
import digitalOceanFilesCustomData from './schemas/digital-ocean-files.custom-data'
import digitalOceanFilesDimensions from './schemas/digital-ocean-files.dimensions'
import digitalOceanFilesStoredFile from './schemas/digital-ocean-files.storedFile'
import digitalOceanFilesMedia from './schemas/digital-ocean-files.media'
import DigitalOceanFilesTool from './tool'

const digitalOceanFiles = definePlugin(() => {
  return {
    name: 'digital-ocean-files',
    schema: {
      types: [
        digitalOceanFilesCustomData,
        digitalOceanFilesDimensions,
        digitalOceanFilesStoredFile,
        digitalOceanFilesMedia,
      ],
    },
    tools: [DigitalOceanFilesTool],
  }
})

export { digitalOceanFiles }
