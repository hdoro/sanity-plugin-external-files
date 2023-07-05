# AWS S3 Digital Asset Management (DAM) plugin for Sanity.io

Allows uploading, referencing and deleting video and audio files to S3 directly from your Sanity studio. Is a flavor of [sanity-plugin-external-dam](https://github.com/hdoro/sanity-plugin-external-dam).

![Screenshot of the plugin](https://raw.githubusercontent.com/hdoro/sanity-plugin-external-dam/main/screenshots.png)

## Installing

Start by installing the plugin:

`sanity install s3-dam`

The rest of the work must be done inside AWS' console. The video below is a full walkthrough, be sure to watch from start to finish to avoid missing small details that are hard to debug.

[![Video screenshot](https://img.youtube.com/vi/Aokoz4j4Dzo/0.jpg)](https://www.youtube.com/watch?v=Aokoz4j4Dzo)

### Creating the S3 bucket

If you already have a bucket, make sure to follow the configuration below.

1. Go into the console homepage for S3 and click on "Create bucket"
1. Choose a name and region as you see fit
1. "Object Ownership": ACL enabled & "Object writer"
1. Untick "Block all public access"
1. Disable "Bucket Versioning"
1. Disable "Default encryption"
1. Once created, click into the bucket's page and go into the "Permissions" tab to configure CORS
1. Configure CORS for your bucket to accept the origins your studio will be hosted in (including localhost)
   - Refer to [S3's guide on CORS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html) if this is new to you (it was for me too!)
   - You can use the template at [s3Cors.example.json](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/aws/s3Cors.example.json)

### Creating the Lambda functions' role for accessing the bucket

1. Go into the Identity and Access Management (IAM) console
1. Start by going into the "Access management -> Policies" tab and "Create new Policy"
1. In the "Create Policy" visual editor
   1. choose S3 as the "Service"
   1. Select the proper "Actions"
      - getSignedUrl needs **"Write->PutObject"** and **"Permissions Management->PutObjectAcl"**
      - deleteObject needs **"Write->DeleteObject"**
   1. In "Resources"
      - "Specific"
      - Click on "Add ARN to restrict access"
      - Fill in the bucket name and "\*" for the object's name (or click on "Any")
        - Or use the ARN (Amazon Resource Name) of your bucket (find it under the bucket's properties tab) with an `/*` appended to it
   1. Leave "Request conditions" empty
   1. Create the policy
1. With the policy created, go into "Access management -> Roles" and "Create role"
   1. "Trusted entity type": AWS Service
   1. "Use case": Lambda
   1. In "Add permissions", select the policy you created above
   1. Name your role
   1. Leave "Step 1: Select trusted entities" as is
   1. Create the role

### Creating the Lambda functions

We'll need to create 2 functions, one for getting signed URLs for posting objects and another for deleting objects. The steps below apply to both:

#### Configuring functions' HTTP access

1. Go into the Lambda console
1. "Create function"
1. "Author from scratch"
1. Runtime: Node.js 14.x or higher
1. Architecture: your call - I'm using x86_64
1. "Permissions" -> "Change default execution role" -> "Use an existing role"
   - Select the role you created above
1. "Advanced settings" -> "Enable function URL"
   - "Auth type": NONE
     - Question:: is there a better way to do this?
   - Check "Configure cross-origin resource sharing (CORS)"
   - "Allow headers": content-type
   - "Allow methods": \*
1. Create the function
1. Open the function's page and, under the "Configuration" tab, select "Function URL" in the sidebar
1. Set "content-type" as an "Allowed Headers" and set "Allowed Methods" to "\*".
1. Save the new configuration

Now we can change the code of each function

#### Editing functions' code

Use the templates at [getSignedUrl.example.js](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/aws/getSignedUrl.example.js) and [deleteObject.example.js](https://github.com/hdoro/sanity-plugin-external-dam/blob/main/packages/aws/deleteObject.example.js).

With the functions' URLs in hand - which you can find in each functions' page -, open the plugin's configuration form in the Sanity tool.

There, you'll fill in the bucket key (ex: `my-sanity-bucket`), the bucket region (ex: `ap-south-1`), the URL for both Lambda functions and an optional secret for validating input in functions.

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
