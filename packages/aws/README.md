# AWS S3 Digital Asset Management (DAM) plugin for Sanity.io

Allows uploading, referencing and deleting video and audio files to S3 directly from your Sanity studio. Is a flavor of [sanity-plugin-external-dam](https://github.com/hdoro/sanity-plugin-external-dam).

![Screenshot of the plugin](https://raw.githubusercontent.com/hdoro/sanity-plugin-external-dam/main/screenshots.png)

## Installing

Start by installing the plugin:

`sanity install s3-dam`

The rest of the work must be done inside AWS' console:

- Create a _public_ S3 bucket (or use an existing one)
- Configure CORS for your bucket to accept the origins your studio will be hosted in (including localhost)
  - Refer to [S3's guide on CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html) if this is new to you (it was for me too!)
  - You can use the template at [s3Cors.example.json](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/aws/s3Cors.example.json)
- Create Lambda functions for creating the pre-signed URLs we'll use to post objects to S3 and deleting objects
  - Use the templates at [getSignedUrl.example.js](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/aws/getSignedUrl.example.js) and [deleteObject.example.js](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/aws/deleteObject.example.js)
  - Set the necessary permissions for execution role of each function:
    - getSignedUrl: "Write->PutObject" and "Permissions Management->PutObjectAcl"
    - deleteObject: "Write->DeleteObject"
  - Make these functions available through HTTP requests by adding API Gateway triggers
    - Ensure these gateways have CORS enabled for the origins you'll use
    - I strongly recommend using the same gateway for both functions for simplicity of configuration

With these in hand, fill-in the plugin's configuration form where you'll fill in the bucket key (ex: `my-sanity-bucket`), the bucket region (ex: `ap-south-1`), the URL for both Lambda functions and an optional secret for validating input in functions.

I plan on recording a video tutorial going through the process in detail. Until then, reach out if you have questions 😉


## Using

Use the `s3-dam.media` type in your fields. Examples:

```
{
    name: "video",
    title: "Video (S3)",
    type: "s3-dam.media",
    options: {
        accept: "video/*",
        storeOriginalFilename: true,
    },
},
{
    name: "anyFile",
    title: "File (S3)",
    type: "s3-dam.media",
    options: {
        // Accept ANY file
        accept: "*",
        storeOriginalFilename: true,
    },
},
```

## Contributing, roadmap & acknowledgments

Refer to [sanity-plugin-external-dam](https://github.com/hdoro/sanity-plugin-external-dam) for those :)