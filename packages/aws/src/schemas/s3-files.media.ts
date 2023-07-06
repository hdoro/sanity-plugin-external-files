import { defineField } from 'sanity'
import Input from '../components/Input'

export default defineField({
  // @TODO: how to handle schema/id changes?
  name: 's3-files.media',
  title: 'S3 media',
  type: 'object',
  components: {
    input: Input as any,
  },
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      // @TODO: how to handle schema/id changes?
      to: [{ type: 's3-files.storedFile' }],
    },
  ],
})
