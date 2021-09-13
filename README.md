# sanity-plugin-external-dam

Series of plugins for working with media files hosted elsewhere inside of Sanity - _currently only audio and video are supported_. Use one of the existing implementations or write your own!

![Screenshot of the plugin](https://raw.githubusercontent.com/hdoro/sanity-plugin-external-dam/main/screenshots.png)

## Existing implementations

List of vendors currently supported:

- AWS S3 -> [sanity-plugin-s3-dam](https://github.com/hdoro/sanity-plugin-external-dam/tree/main/packages/aws)
- Google Firebase -> [sanity-plugin-firebase-dam](https://github.com/hdoro/sanity-plugin-external-dam/tree/main/packages/firebase)

I'm currently considering building one for Supabase.

## Creating your own implementation

I'm yet to properly document how to create your own implementation, so please reach out if you're looking into doing it! You can get a hold of me at [opensource@hdoro.dev](mailto:opensource@hdoro.dev) or by [messaging me in the Sanity Slack community](https://sanity-io-land.slack.com/team/UB1QTEXGC).

While that documentation gets sorted out, be sure to take a look at the configuration for the [Firebase plugin](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/firebase/src/config.ts) and for the [S3 plugin](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/aws/src/config.ts).

## Roadmap

From my own standpoint and use cases, this _plugin is feature complete_.

That said, I'm willing to develop it further given the interest and resources. Here's a list of features and improvements we could pursue:

- **Support for images, PDFs and other file types** other than video and audio
  - I personally didn't consider these for the first launch as Sanity-native images are way more powerful than any regular storage vendors and I haven't had the use-case for others
- **Synchronizing files** uploaded to vendors outside of Sanity
  - ✨ Solves: this would make it possible to have multiple entries to your storage buckets and using Sanity as the single source of truth. A significantly better experience than opening AWS S3's console and managing files there, for example.
  - This actually doesn't involve much code on the plugin side. It'd be more about providing a blessed path for implementing webhooks in a simpler way by developers.
  - If you already have this demand, just take a look at your used plugin's schema and try to build a handler for new files in your vendor that creates documents in Sanity following that schema.

## Contributing

I'm a newbie with collaborating on open-source, so no strict rules here other than **being respectful and considerate**.

## Acknowledgments

Immense gratitude to Akash Reddy and the folks at Playy.co for sponsoring the initial work for this plugin and helping shape it. You gave me the first opportunity to do paid open-source work and this won't be forgotten 💚