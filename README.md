# cdn-sync

Synchronise a local directory with AWS CloudFront / S3, maintaining correct headers, etc.

- this is a command-line Node.JS tool
- Node.JS and NPM are required to use this
- sufficient to replace s3cmd, cdn-sync has better MIME detection
- for use with Amazon Web Services (CloudFront and Simple Storage Service a.k.a S3)

## Getting Started

1. install the command-line tool with: `npm -g install cdn-sync`
2. set up your AWS S3 Buckets retrieve your IAM credentials
3. save a `.cdn-sync.json` file in the top-level of the directory to sync
4. run `cdn-sync` from within that directory (or any sub-directory

## Goals

- compatibility with more CDN providers
- provide server and client-side code for user agent compatibility test

## Why is this useful?

- CLI tools are easily scripted, making automated deployments easy
- the [de-facto tool](http://s3tools.org/s3cmd) does not always result in correct headers
- JavaScript and other text-based web resources should be GZIP deflated whenever possible
- AWS CloudFront and S3 do not currently offer an automatic deflation feature, so content
  must be separately deflated and uploaded to S3 (with the correct Content-Encoding header)

## Why bother?

Most browsers today support GZIP-deflated content:
- http://webmasters.stackexchange.com/questions/22217/which-browsers-handle-content-encoding-gzip-and-which-of-them-has-any-special
- http://stackoverflow.com/questions/575290/which-browsers-claim-to-support-http-compression-but-are-actually-flaky

If you are confident that you don't need to support these ancient user agents, then you may
skip detection completely and just assume that all of your users have modern web browsers.

### Configuration
_(Coming soon)_

## Documentation

- [discussion of deployment strategies](doc/deployment.md)

## Examples

### Example .cdn-sync.json

```
{
  "targets": [
    {
      "type": "aws",
      "options": {
        "accessKeyId": "...",
        "secretAccessKey": "...",
        "region": "...",
        "sslEnabled": true,
        "Bucket": "..."
      },
      "strategy": ["clone"]
    }
  ]
}
```

Note: for targets[index].options, use the options you would pass to the [AWS.S3 constructor](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3_20060301.html#constructor-property).

## Contributing
Formal styleguide for this project is JSLint. See JSLint settings at the top of
each file.

Add unit tests for any new or changed functionality. Lint and test your code
using [Grunt](http://gruntjs.com/).

    grunt test

This project uses [Git Flow](https://github.com/nvie/gitflow), so the master
branch always reflects what is in production (i.e. what is in the NPM repository).
New code should be merged into the develop branch.

## Release History

See [GitHub Releases](https://github.com/jokeyrhyme/cdn-sync/releases)

## License
Copyright (c) 2013 Ron Waldon
Licensed under the MIT license.
