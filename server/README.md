Websites that don't set a `Access-Control-Allow-Origin: *` header aren't actually public urls, so you can't call them via javascript in the webpage. That's why there's no cross-origin errors when navigating in the browser or using curl in the cli, but there are errors when trying to call javascript.

This server, when run, simply 
1. Serves the solidjs frontend of the webpage, and 
2. Has a single at `/get` that takes in a `url` search query, and returns the string of the webpage
  - Now we're using a server, we've come full circle from the original cash to the current cash.
  - Which is slightly nerfed because it cannot be accessed from a phone