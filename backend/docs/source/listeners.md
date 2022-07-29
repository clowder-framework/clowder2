# Listeners in Clowder

In Clowder v1, extractors were initially intended to extract metadata automatically from 
incoming files based on MIME type, and the extracted metadata could then be indexed for search 
and other purposes. As Clowder grew, different projects began to expand the extractor framework 
to do much more than extract metadata: 


In Clowder v2, we are improving support for these types of activities. While existing extractors 
will largely function the same way in Clowder - connect to a RabbitMQ message bus and process
event messages sent by Clowder to the corresponding queue - the way in which extractors can be 
assigned and triggered has been expanded. Additionally, extractors are now just one type of 
behavior in a larger framework called **Listeners** that can benefit from this feature.

## Types of Listeners

A listener is a process running apart from Clowder, typically in a container or VM, that is listening
to a RabbitMQ feed for messages from Clowder. When a message is received, Clowder indicates which resources
the listener will need to download and any parameters the user who sent the message provided. The listener
will also receive a temporary API key from the user granting them equivalent permissions.

What the listener does with the resources and any results will depend:
- examine files or datasets and generate metadata JSON that is attached to the resource;
- create new files or datasets;
- populate databases and web services; 
- trigger downstream workflows dependent on the status of other extractors in orchestration; 
- submit jobs to external HPC resources. 

The Listeners dashboard provides a list of listeners that Clowder has received a heartbeat from:
- Name
- Version
- Description
- Supported parameters
- First heartbeat
- Most recent heartbeat
- Number of feeds associated
- Activate/deactivate

When a heartbeat is received from a new listener, Clowder will attempt to match it to any existing feeds
according to the extractor_info JSON. Legacy extractors 

## Defining Listener Feeds

A feed is a named set of criteria that can be assigned listeners. When new files arrive that meet the criteria, 
any assigned listeners are triggered. 

The Feeds dashboard helps users manage this:
- Any search query can be saved as a feed from the Search page
- Possible criteria include:
   - Filename (regular expressions supported)
   - MIME type
   - File size
   - Parent collection / dataset / folder
   - User or user group
   - Metadata fields
   - Feeds without criteria will be notified of everything.
   
- Feeds can be specified for Files or Datasets
   - Dataset feeds allow multiple file criteria to be listed
   - When a dataset contains files that match every criteria, notify listeners
   - Process every file/dataset that comes in automatically, or only manually? (toggle)
   
- On request, users can calculate feed statistics:
   - Number of files meeting criteria
   - Per feed, number of files that have been successfully processed
   - Per feed, number of files that have ben unsuccessfully processed
   - Per feed, number of files that have not been submitted

