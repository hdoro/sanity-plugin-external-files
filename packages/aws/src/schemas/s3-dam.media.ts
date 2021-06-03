import Input from '../components/Input'

export default {
  name: 's3-dam.media',
  title: 'S3 media',
  type: 'object',
  inputComponent: Input,
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'reference',
      to: [{ type: 's3-dam.storedFile' }],
    },
  ],
}
