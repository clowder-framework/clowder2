# Visualizations in Clowder

When browsing Clowder, there are two primary ways users can see aspects of a file or dataset without downloading it:

- Thumbnails, which are lightweight static images that appear in grid views such as search results; and
- Visualizations, which appear on individual resource pages and trigger JavaScript modules to create more specific
  preview components such as map views or interactive widgets.

Both of these are controlled

## Thumbnails

To programatically add a thumbnail to a file or dataset:

1. POST an image to the `api/v2/thumbnails` endpoint to upload it to the system. The response will include
   a `thumbnail_id`.
2. Associate the thumbnail with one or more resources by issuing a PATCH request
   to `api/v2/files/:file_id/thumbnails/:thumbnail_id` or `api/v2/datasets/:dataset_id/thumbnails/:thumbnail_id`.
3. Retrieve the thumbnail (e.g. to render on a frontend GUI) by issuing a GET request
   to `api/v2/files/:file_id/thumbnail`.

## Visualizations

Visualizations can be more complex than Thumbnails, and as such they include a JSON config document along with any
actual bytes necessary to render. 
