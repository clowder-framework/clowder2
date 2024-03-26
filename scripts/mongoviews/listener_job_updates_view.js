db.getCollection("listener_job_updates").aggregate(

    // Pipeline
    [
        // Stage 1
        {
            $lookup: // Equality Match
            {
                from: "listener_jobs",
                localField: "job_id",
                foreignField: "_id",
                as: "listener_job_details"
            }

            // Uncorrelated Subqueries
            // (supported as of MongoDB 3.6)
            // {
            //    from: "<collection to join>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to execute on the collection to join> ],
            //    as: "<output array field>"
            // }

            // Correlated Subqueries
            // (supported as of MongoDB 5.0)
            // {
            //    from: "<foreign collection>",
            //    localField: "<field from local collection's documents>",
            //    foreignField: "<field from foreign collection's documents>",
            //    let: { <var_1>: <expression>, …, <var_n>: <expression> },
            //    pipeline: [ <pipeline to run> ],
            //    as: "<output array field>"
            // }
        },

        // Stage 2
        {
            $facet: {
                "extraction_on_dataset" : [
                    {
                        "$match" : {
                            "listener_job_details.resource_ref.collection" : {
                                "$eq" : "dataset"
                            }
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : "authorization",
                            "localField" : "listener_job_details.resource_ref.resource_id",
                            "foreignField" : "dataset_id",
                            "as" : "auth"
                        }
                    }
                ],
                "extraction_on_file" : [
                    {
                        "$match" : {
                            "listener_job_details.resource_ref.collection" : {
                                "$eq" : "file"
                            }
                        }
                    },
                    {
                        "$lookup" : {
                            "from" : "files",
                            "localField" : "listener_job_details.resource_ref.resource_id",
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

        // Stage 3
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

        // Stage 4
        {
            $unwind: "$all"
        },

        // Stage 5
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
