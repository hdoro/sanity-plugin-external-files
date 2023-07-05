# Firebase Digital Asset Management (DAM) plugin for Sanity.io

Allows uploading, referencing and deleting video and audio files to Firebase directly from your Sanity studio. Is a flavor of [sanity-plugin-external-files](https://github.com/hdoro/sanity-plugin-external-files).

![Screenshot of the plugin](https://raw.githubusercontent.com/hdoro/sanity-plugin-external-files/main/screenshots.png)

## Installing

Start by installing the plugin:

`sanity install firebase-dam`

Add your bucket URL and API key to the plugin via the dedicated settings dialog.

I plan on recording a video tutorial going through the process in detail. Until then, reach out if you have questions 😉

## Using

Use the `firebase-files.media` type in your fields. Examples:

```
{
    name: "video",
    title: "Video (Firebase)",
    type: "firebase-files.media",
    options: {
        accept: "video/*",
        storeOriginalFilename: true,
    },
},
{
    name: "anyFile",
    title: "File (Firebase)",
    type: "firebase-files.media",
    options: {
        // Accept ANY file
        accept: "*",
        storeOriginalFilename: true,
    },
},
```

## Contributing, roadmap & acknowledgments

Refer to [sanity-plugin-external-files](https://github.com/hdoro/sanity-plugin-external-files) for those :)
