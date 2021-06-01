import client from 'part:@sanity/base/client'
import { SanityClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const sanityClient = client.withConfig({
  apiVersion: '2021-03-25',
}) as SanityClient

export default sanityClient

export const imageBuilder = imageUrlBuilder(sanityClient)
