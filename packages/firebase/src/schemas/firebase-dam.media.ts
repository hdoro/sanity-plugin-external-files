import Input from '../components/Input'

export default {
  name: 'firebase-dam.media',
  title: 'Firebase media',
  type: 'object',
  inputComponent: Input,
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      to: [{ type: 'firebase-dam.storedFile' }],
    },
  ],
}
