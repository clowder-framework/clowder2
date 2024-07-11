![](docs/source/img/logo_full.png)

# Clowder v2 (In active development)
[![Build Status](https://github.com/clowder-framework/clowder2/actions/workflows/pytest.yml/badge.svg?branch=main)](https://github.com/clowder-framework/clowder2/actions?query=branch%3Amain)
[![Slack](https://img.shields.io/badge/Slack-4A154B?&logo=slack&logoColor=white)](https://join.slack.com/t/clowder-software/shared_invite/zt-4e0vo0sh-YNndJEuLtPGRa7~uIlpcNA)

[//]: # ([![Documentation Status]&#40;https://readthedocs.org/projects/clowder2/badge/?version=latest&#41;]&#40;https://clowder2.readthedocs.io/en/latest/?badge=latest&#41;)

*For the previous version of Clowder, please see [Clowder v1](https://github.com/clowder-framework/clowder).*

Clowder v2 is a reimagining of the [Clowder research data management system](https://clowderframework.org/)
using a different and newer technology stack. Clowder is a cloud native data management framework to support any
research domain. Clowder was developed to help researchers and scientists in data intensive domains manage raw data,
complex metadata, and automatic data pipelines.

While the Clowder v1 has worked well over the years, many of the underlying
technologies and libraries have not received enough support in recent years and new developers have had a challenging
time learning how to contribute to it.
Clowder v2 is also an opportunity to leverage our experience working with
research data in Clowder and deliver a better solution to common problems researchers encounter when working with data.

Clowder v2 provides:

- a better user experience and user interface
- an easier code base to pick up and modify written in Python/FastAPI and Typescript/React
- new features based on our experience working with researchers

## Documentation

The v2 documentation is still work in progress. It's available at https://clowder2.readthedocs.io.

The v1 documentation is not fully compatible with v2, but it does provide some still relevant information.
It is available at https://clowder-framework.readthedocs.io.
There is a few other documentation links available on the [website](https://clowderframework.org/documentation.html).

## Installation

The easiest way of running Clowder v2 is checking out the [code](https://github.com/clowder-framework/clowder2)
and running `docker compose up` in the main directory. If you would like to run Clowder with JupyterHub,
you can use our script `docker-prod.sh` to start the services. Run `./docker-prod.sh prod up` to start the services
and `./docker-prod.sh prod down` to stop them.

Helm charts are available for running Clowder v2 on Kubernetes. See the [helm](https://github.com/clowder-framework/clowder2/tree/main/deployments/kubernetes/charts) directory for more information.

## Contributing

We are always looking for contributors. This could be anything from fixing bugs, adding new features, providing new
feature requests, reccomending UI/UX improvements, helping with the documentation, or just testing the system and
providing feedback. Here are a few ways to get started:

- Join our [Slack](https://join.slack.com/t/clowder-software/shared_invite/zt-4e0vo0sh-YNndJEuLtPGRa7~uIlpcNA)
  channel, introduce yourself, and ask questions about the specific aspects of the system you are interested in.
- Submit an issue (bug or feature request) on the [issue tracker](https://github.com/clowder-framework/clowder2/issues).
- Submit a [pull request](https://github.com/clowder-framework/clowder2/pulls) with a bug fix or new feature. For
  larger changes, it's best to open an issue first or ask on Slack to discuss the changes.
- Develop new [information extractors](https://github.com/clowder-framework/pyclowder) and/or visualizations.

Please follow our [code of conduct](https://github.com/clowder-framework/clowder/blob/develop/CODE_OF_CONDUCT.md) when
interacting with the community.

## Support & Contacts

The easiest way to get in touch with us is [Slack](https://join.slack.com/t/clowder-software/shared_invite/zt-4e0vo0sh-YNndJEuLtPGRa7~uIlpcNA).
This is a public forum. If you prefer email, you can contact us at [clowder@lists.illinois.edu](mailto:clowder@lists.illinois.edu).

## License

Clowder v2 is licensed under the [Apache 2.0 license](https://github.com/clowder-framework/clowder2/blob/main/LICENSE).
