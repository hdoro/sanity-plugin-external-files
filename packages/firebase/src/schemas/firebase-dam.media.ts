import Input from '../components/Input'

export default {
  name: 'external-dam.media',
  title: 'External DAM media',
  type: 'object',
  inputComponent: Input,
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      to: [{ type: 'external-dam.storedFile' }],
    },
  ],
}
