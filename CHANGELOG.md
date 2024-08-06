# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [v2.0.0-beta.3] - 2024-07-29

### Added

- License management
- Release dataset with versions
- Enable and disable user account through Keycloak
- Jupyterhub integration
- Interface for creating and editing matching criteria for triggering extractors
- Interface for editing metadata definitions
- My dataset tab listing all the datasets created by the user
- Drag and drop upload multiple files
- Footer with links to documentation, source code, and contact information
- Documentation through MKDocs

### Changed

- Allow public datasets and files to be searchable
- List all the extractors with the ability to enable/disable the extractors
- Filter listeners based on their support for file or dataset
- Helm chart updated to support custom existing secret

### Fixed

- Clowder registration link on the top bar
- Case-insensitive search
- Download count immediately increments after download

## [v2.0.0-beta.2] - 2024-02-16

### Added

- Super Admin functionality implemented.
- Helm chart published to Artifact Hub.
- GUI now supports viewing and modifying metadata definitions.
- Examples of custom visualizations added, including netCDF, Vega, and iframe.

### Changed

- Pagination refactored for increased flexibility in page navigation.

## [v2.0.0-beta.1] - 2023-11-27

### Added

- Initial implementation of Extractors.
- Initial implementation of Visualization.
- Group, roles, and dependencies functionalities added.
- Group implementation initiated.

### Changed

- README updated with relevant changes.
- Improved accessibility to Swagger API documentation.

## [alpha-2] - 2022-11-28

### Added

- Use Keycloak for user management, JWT tokens and federated identity.
- Initial implementation of file versioning and nested folders within datasets.
- Initial implementation of metadata entries and metadata definitions.
- Initial implementation of search using Elasticsearch.
- Improvements to overall UI and UX. Standardized components and widgets used.
- Helm charts for Kubernetes deployment.

[v2.0.0-beta.2]: https://github.com/clowder-framework/clowder2/releases/tag/v2.0.0-beta.2

[v2.0.0-beta.1]: https://github.com/clowder-framework/clowder2/releases/tag/v2.0.0-beta.1

[alpha-2]: https://github.com/clowder-framework/clowder2/releases/tag/v2.0.0-alpha.2
