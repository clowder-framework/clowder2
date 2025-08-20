db.getCollection("files").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $lookup: {
                "from" : "authorization",
                "localField" : "dataset_id",
                "foreignField" : "dataset_id",
                "as" : "auth"
            }
        }
    ],

    // Options
    {

    }

    // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
