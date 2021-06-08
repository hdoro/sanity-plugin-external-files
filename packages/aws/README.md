# AWS S3 Digital Asset Management (DAM) plugin for Sanity.io

Allows uploading, referencing and deleting video and audio files to S3 directly from your Sanity studio. Is a flavor of [sanity-plugin-external-dam](https://github.com/hdoro/sanity-plugin-external-dam).

## Installing

- Create Lambda functions following the templates
- Set the necessary permissions for execution role of each function:
  - signedUrl: "Write->PutObject" and "Permissions Management->PutObjectAcl"
  - deleteObject: "Write->DeleteObject"
- Don't forget to configure CORS for your bucket
- Make your bucket public