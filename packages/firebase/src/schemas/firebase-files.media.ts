import { defineField } from 'sanity'
import Input from '../components/Input'

export default defineField({
  // @TODO: how to handle schema/id changes?
  name: 'firebase-files.media',
  title: 'Firebase media',
  type: 'object',
  components: {
    input: Input as any
  },
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      // @TODO: how to handle schema/id changes?
      to: [{ type: 'firebase-files.storedFile' }],
    },
  ],
})