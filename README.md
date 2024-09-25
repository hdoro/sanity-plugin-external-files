# sanity-plugin-external-files

Series of plugins for working with media files hosted elsewhere inside of Sanity.

![Screenshot of the plugin](https://raw.githubusercontent.com/hdoro/sanity-plugin-external-files/main/screenshots.png)

## Existing implementations

List of vendors currently supported:

- AWS S3 -> [sanity-plugin-s3-files](https://github.com/hdoro/sanity-plugin-external-files/tree/main/packages/aws)
- Google Firebase -> [sanity-plugin-firebase-files](https://github.com/hdoro/sanity-plugin-external-files/tree/main/packages/firebase)
- DigitalOcean Spaces -> [sanity-plugin-digital-ocean-files](https://github.com/hdoro/sanity-plugin-external-files/tree/main/packages/digital-ocean)
- Cloudflare R2 -> [sanity-plugin-r2-files](https://github.com/hdoro/sanity-plugin-external-files/tree/main/packages/cloudflare-r2)

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
- **New vendors**, such as Supabase and Storj.io

## Contributing

To get the project working locally:

1. Install dependencies with `pnpm i` from the root directory
   - pnpm@9.11 or higher is required - refer to [their installation guide](https://pnpm.io/installation)
   - This project uses [Turborepo](https://turbo.build/repo) as a monorepo manager. From a single dev command you'll be working across all packages and the test studio.
2. Populate the test studio's `.env` file with your keys, following the `.env.example` file.
   - You'll need to create or select a Sanity project
   - For each vendor, you'll need to create a bucket and get the keys to connect to it
3. Run `pnpm dev` from the root directory to start the studio and the development servers for all packages.
4. Open the test studio at `http://localhost:3333`
   - You may need to adjust `test-studio/sanity.config.js` to include a new vendor or remove others while testing a specific one.

Any changes in the plugins or core package will be picked up by the test studio, with some level of hot module reloading.

On rules of conduct, I'm a newbie with collaborating on open-source, so no strict rules here other than **being respectful and considerate**.

### Cutting new releases

1. Run `pnpm run build` to build the packages to ensure builds are working and there are no Typescript errors
2. Bump the packages' versions via [changesets](https://github.com/changesets/changesets) by running `pnpm run changeset`
3. Run `pnpm run update-package-versions` to ensure all packages' versions are correctly updated
4. Run `pnpm run publish-packages` to publish the packages

## Acknowledgments

Immense gratitude to Akash Reddy and the folks at Playy.co for sponsoring the initial work for this plugin and helping shape it. You gave me the first opportunity to do paid open-source work and this won't be forgotten 💚

Also shout-out to Daniel, José and the great folks at [Bürocratik](https://burocratik.com/) for sponsoring the Sanity V3 upgrade of this plugin.
