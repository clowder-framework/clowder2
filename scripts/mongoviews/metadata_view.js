db.getCollection("metadata").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $facet: {
                "metadata_on_dataset" : [
                    {
                        "$match" : {
                            "resource.collection" : {
                                "$eq" : "datasets"
                            }
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : "authorization",
                            "localField" : "resource.resource_id",
                            "foreignField" : "dataset_id",
                            "as" : "auth"
                        }
                    }
                ],
                "metadata_on_file" : [
                    {
                        "$match" : {
                            "resource.collection" : {
                                "$eq" : "files"
                            }
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : "files",
                            "localField" : "resource.resource_id",
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
                        "$metadata_on_dataset",
                        "$metadata_on_file"
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
