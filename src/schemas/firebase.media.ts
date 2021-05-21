import Input from '../components/Input/Input'

export default {
  name: 'firebase.media',
  title: 'Firebase media',
  type: 'object',
  inputComponent: Input,
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      to: [{ type: 'firebase.storedFile' }],
    },
  ],
}
