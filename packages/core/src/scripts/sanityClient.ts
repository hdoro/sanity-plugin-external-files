import { useClient } from 'sanity'

export const useSanityClient = () => useClient({ apiVersion: '2023-07-05' })
