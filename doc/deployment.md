# cdn-sync

## Deployment

### Option A: single, mixed destination

- **best if your dev-ops won't give you a second S3 bucket**
- only certain files are deflated
- deflated copies have `.gz` appended to their filename
- your URLs will need to add the `.gz` if browser support is sufficient

### Option B: dual destination

- **potentially the easiest for front-end developers**
- one destination for completely uncompressed content
- other destination for content that has been deflated where appropriate
- both destinations have copies of all files (URL paths are the same)
- your URLs will need to pick the right domain, based on browser support

### Option C: pure sync, assumes automatic compression

- **best if your CDN offers automatic compression**
- just like option A but without any pre-compression
- this option will be the last to be implemented, as other tools probably do this better

## Strategy

If you are using AWS CloudFront and S3, then it is recommended that you detect whether the
user agent understands deflated content. This is typically indicated by the presence of the
following HTTP header:

    Accept-Encoding: gzip, deflate

If the value of this header contains 'gzip', then the user agent should be served content
with URLs pointing to the deflated content.

The problem is there is no simple way to perform this detection in JavaScript. The value of
this header is not directly available in any globally accessible variable or object.

### Client-Side Detection (JavaScript)

1. store a small JavaScript file with a simple global variable assignment in the CDN
2. using a script element, [dynamic loader](http://yepnopejs.com/) or
   [jQuery.getScript](http://api.jquery.com/jQuery.getScript/), atttempt to load and run
   the deflated version of this JavaScript file
3. if the global variable is assigned as expected, then continue to use the URLs for
   deflated content, otherwise switch to URLs for uncompressed content

### Server-Side Detection

Your HTTP server will have access to the HTTP headers from the user agent. In the dynamic
server-side script that creates your initial HTML, check the value of the Accept-Encoding
header.

Based on this value, output HTML with the appropriate URLs. It is also recommended that you
insert a script element that defines a global variable. Your client-side JavaScript will be
able to use this global variable to correctly select between your content URLs.
