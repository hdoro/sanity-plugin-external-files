# Sanity.io plugin for storing large files in Digital Ocean Spaces

Allows uploading, referencing and deleting video and audio files to DigitalOcean directly from your Sanity studio. Is a flavor of [sanity-plugin-external-files](https://github.com/hdoro/sanity-plugin-external-files).

![Screenshot of the plugin](https://raw.githubusercontent.com/hdoro/sanity-plugin-external-files/main/screenshots.png)

## Installing

Start by installing the plugin:

`sanity install digital-ocean-files`

The rest of the work must be done inside DigitalOcean's console:

- Create a _public_ Digital Ocean Space (or use an existing one)
- Configure CORS for your Space to accept the origins your studio will be hosted in (including localhost)
  - Refer to [DigitalOcean's guide on CORS on Spaces](https://docs.digitalocean.com/products/spaces/how-to/configure-cors/) if this is new to you (it was for me too!)
- To use the Spaces API, you need to [create an access key and secret key](https://docs.digitalocean.com/products/spaces/how-to/manage-access/#access-keys) for your Space from the [API page in the control panel](https://cloud.digitalocean.com/settings/api/tokens).
- Create server endpoints for creating the pre-signed URLs we'll use to post objects to DigitalOcean and deleting objects
  - If using serverless, use the templates at [getSignedUrl.example.js](https://github.com/hdoro/sanity-plugin-external-files/blob/main/packages/digital-oean/getSignedUrl.example.js) and [deleteObject.example.js](https://github.com/hdoro/sanity-plugin-external-files/blob/main/packages/digital-oean/deleteObject.example.js)

With these in hand, fill-in the plugin's configuration form where you'll fill in the bucket key (ex: `my-sanity-bucket`), the Space region (ex: `ams3`), the URL for both server endpoints and an secret for validating input in functions.

I plan on recording a video tutorial going through the process in detail. Until then, reach out if you have questions 😉

## Using

Use the `digital-ocean-files.media` type in your fields. Examples:

```
{
    name: "video",
    title: "Video (DigitalOcean)",
    type: "digital-ocean-files.media",
    options: {
        accept: "video/*",
        storeOriginalFilename: true,
    },
},
{
    name: "anyFile",
    title: "File (DigitalOcean)",
    type: "digital-ocean-files.media",
    options: {
        // Accept ANY file
        accept: "*",
        storeOriginalFilename: true,
    },
},
```

## Contributing, roadmap & acknowledgments

Refer to [sanity-plugin-external-files](https://github.com/hdoro/sanity-plugin-external-files) for those :)
