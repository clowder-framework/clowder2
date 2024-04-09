db.getCollection("listener_jobs").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $facet: {
                "extraction_on_dataset" : [
                    {
                        "$match" : {
                            "resource_ref.collection" : {
                                "$eq" : "dataset"
                            }
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : "authorization",
                            "localField" : "resource_ref.resource_id",
                            "foreignField" : "dataset_id",
                            "as" : "auth"
                        }
                    }
                ],
                "extraction_on_file" : [
                    {
                        "$match" : {
                            "resource_ref.collection" : {
                                "$eq" : "file"
                            }
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : "files",
                            "localField" : "resource_ref.resource_id",
                            "foreignField" : "_id",
                            "as" : "file_details"
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : "authorization",
                            "localField" : "file_details.dataset_id",
                            "foreignField" : "dataset_id",
                            "as" : "auth"
                        }
                    }
                ]
            }
        },

        // Stage 2
        {
            $project: {
                "all" : {
                    "$concatArrays" : [
                        "$extraction_on_dataset",
                        "$extraction_on_file"
                    ]
                }
            }
        },

        // Stage 3
        {
            $unwind: "$all"
        },

        // Stage 4
        {
            $replaceRoot: {
                "newRoot" : "$all"
            }
        }
    ],

    // Options
    {

    }

    // Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
