# File Storage in Clowder

*This is a draft of proposed features and not yet implemented.*

By default, Clowder will store files uploaded to the system in its own Minio storage database. However, there are
additional options to store or reference files elsewhere. Note that file versioning is not supported with some options.

### Storing on Local Filesystem

For all local options, file versioning is not supported. Clowder will not recognize if the underlying file changes, and
uploading duplicate filenames will simply overwrite the existing file and update the size and date.

#### Adding existing local files

Privileged users can add local files by directory path. Local directories can be whitelisted so that files outside
those directories cannot be added. Access to the local filesystem is a separate permission that can be granted by
administrators, either for all whitelisted root directories or on an individual basis.

This will not create a copy of the file bytes, but instead store a pointer to the original location. If the file is
renamed, moved or deleted, the Clowder link will be broken. The next time someone tries to download the file, it will
be marked as Invalid Link. From then on, the Download button will be replaced with a Recheck Link button that will
remove the Invalid Link label if the file reappears.

#### Uploading new files to local storage

Clowder can also be configured with a root directory to store newly uploaded files. Dataset IDs will be used to create
folder structures (because unique dataset names are not required), but filenames will be kept inside those folders. This
is familiar for instances that want to mirror a traditional filesystem structure in a Clowder instance.

Optionally, local storage space usage can be restricted with an overall storage quota and a per-user storage quota.

#### Synced Folders

A synced folder is a special type of folder where privileged users add a local folder reference just as they would a
local file reference. The folder is scanned and files are automatically added to Clowder according to the contents of
the directory. Periodically the folder will be rescanned and files will be added or deleted as necessary.

Clowder can be generally configured to restrict the recursive depth to which folders are scanned, to control whether
folders are automatically scanned at some interval or should only be scanned upon user access, and whether to trigger
extractors on files added through this process.

If the synced folder is renamed, moved or deleted, the folder will be marked as an Invalid Link similar to files above.

### Storing References (URLs)

Users can also add a link to an external file in Clowder. A name can be given along with the link.

Features such as metadata, visualizations and extractors are still supported, but no actual file bytes will be stored
in Clowder. By default, the file bytes will NOT be downloaded for visualization purposes like they are in local storage
cases to avoid incurring download costs, but Clowder can be configured with a separate maximum file size limit to
override this and do things like display thumbnails for external images.

If Clowder cannot access the file during upload, Clowder will ask the uploader if the file requires access credentials.
If not, the upload will be rejected as inaccessible. If so, the file will be displayed with a lock icon on the Download
button to indicate to users that external credentials are required.

In the future, Clowder will support the secure storage of credentials on a domain basis to allow Clowder services or, if
desired, external users access to the file using these stored credentials.

Attempting to download an external file that no longer exists will mark an Invalid Link similar to files above.

### Storing in the Cloud (S3)

Clowder can also be configured with an external Amazon S3 configuration to upload files to object-based storage on AWS.

Versioning and quotas are supported as described above.
