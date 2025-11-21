# Migration

these scripts are used to migrate data from a clowder v1 to v2 instance

## config.toml 

This file can be used to limit what gets migrated by space or user. 

## steps to run migration


1. setup a clowder v2 instance and make sure it is running
2. add your values to the .env and the config.toml file
3. run the script `get_collections.py` this gets all collections from the v1 instance
4. run the script `get_collection_datasets.py` this gets all the datasets in the collections
5. run the script `dataset_collection_json.py` this creates a json file that shows which datasets are in a collection, and which are not. The datasets that are in a collection will be migrated to folders, while theo nes that are not will  be migrated to datasets
5. Now you are ready to run `migrate.py` - it uses the data from the previous scripts to place datasets into the right collections

