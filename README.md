# sanity-plugin-external-files

Series of plugins for working with media files hosted elsewhere inside of Sanity.

![Screenshot of the plugin](https://raw.githubusercontent.com/hdoro/sanity-plugin-external-files/main/screenshots.png)

## Existing implementations

List of vendors currently supported:

- AWS S3 -> [sanity-plugin-s3-files](https://github.com/hdoro/sanity-plugin-external-files/tree/main/packages/aws)
- Google Firebase -> [sanity-plugin-firebase-files](https://github.com/hdoro/sanity-plugin-external-files/tree/main/packages/firebase)
- DigitalOcean Spaces -> [sanity-plugin-digital-ocean-files](https://github.com/hdoro/sanity-plugin-external-files/tree/main/packages/digital-ocean)

Use one of the existing implementations or write your own!

## Creating your own implementation

I'm yet to properly document how to create your own implementation, so please reach out if you're looking into doing it! You can get a hold of me at [opensource@hdoro.dev](mailto:opensource@hdoro.dev).

While that documentation gets sorted out, be sure to take a look at the configuration for the [Firebase plugin](https://github.com/hdoro/sanity-plugin-external-files/blob/main/packages/firebase/src/config.ts) and for the [S3 plugin](https://github.com/hdoro/sanity-plugin-external-files/blob/main/packages/aws/src/config.ts). The core plugin does the heavy lifting: the full implementation of the DigitalOcean plugin is 330 lines of code, including types and documentation ✨

## Roadmap

From my own standpoint and use cases, this _plugin is feature complete_.

That said, I'm willing to develop it further given the interest and resources. Here's a list of features and improvements we could pursue:

- **Synchronizing files** uploaded to vendors outside of Sanity
  - ✨ Solves: this would make it possible to have multiple entries to your storage buckets and using Sanity as the single source of truth. A significantly better experience than opening AWS S3's console and managing files there, for example.
  - This actually doesn't involve much code on the plugin side. It'd be more about providing a blessed path for implementing webhooks in a simpler way by developers.
  - If you already have this demand, just take a look at your used plugin's schema and try to build a handler for new files in your vendor that creates documents in Sanity following that schema.
- Previews for PDFs and other file types
- **New vendors**
  - I'd love to suport [Cloudflare's R2 Storage](https://blog.cloudflare.com/introducing-r2-object-storage/) & Supabase

## Contributing

I'm a newbie with collaborating on open-source, so no strict rules here other than **being respectful and considerate**.

## Acknowledgments

Immense gratitude to Akash Reddy and the folks at Playy.co for sponsoring the initial work for this plugin and helping shape it. You gave me the first opportunity to do paid open-source work and this won't be forgotten 💚

Also shout-out to Daniel, José and the great folks at Burocratik for sponsoring the Sanity V3 upgrade of this plugin.

- Documentar
- Publicar
