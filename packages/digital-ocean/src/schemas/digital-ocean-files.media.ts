import { Rule } from "@sanity/types"
import Input from '../components/Input'

export default {
  name: 'digital-ocean-files.media',
  title: 'Digital Ocean media',
  type: 'object',
  inputComponent: Input,
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      to: [{ type: 'digital-ocean-files.storedFile' }],
      validation: (Rule: Rule) => Rule.required(),
    },
  ],
}
