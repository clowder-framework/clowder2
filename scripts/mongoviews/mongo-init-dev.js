function init(databaseName) {
  db = db.getSiblingDB(databaseName);

  db.createCollection("authorization");
  db.createCollection("datasets");
  db.createCollection("feeds");
  db.createCollection("file_versions");
  db.createCollection("files");
  db.createCollection("folders");
  db.createCollection("listener_job_updates");
  db.createCollection("listener_jobs");
  db.createCollection("listeners");
  db.createCollection("metadata");
  db.createCollection("metadata.definitions");
  db.createCollection("tokens");
  db.createCollection("users");
  db.createCollection("user_keys");

  db.createView("datasets_view", "datasets", [
    {
      $lookup: {
        from: "authorization",
        localField: "_id",
        foreignField: "dataset_id",
        as: "auth",
      },
    },
  ]);

  db.createView("files_view", "files", [
    {
      $lookup: {
        from: "authorization",
        localField: "dataset_id",
        foreignField: "dataset_id",
        as: "auth",
      },
    },
  ]);

  db.createView("folders_view", "folders", [
    {
      $lookup: {
        from: "authorization",
        localField: "dataset_id",
        foreignField: "dataset_id",
        as: "auth",
      },
    },
  ]);

  db.createView("listener_job_updates_view", "listener_job_updates", [
    {
      // Equality Match
      $lookup: {
        from: "listener_jobs",
        localField: "job_id",
        foreignField: "_id",
        as: "listener_job_details",
      },
    },
    {
      $facet: {
        extraction_on_dataset: [
          {
            $match: {
              "listener_job_details.resource_ref.collection": {
                $eq: "dataset",
              },
            },
          },
          {
            $lookup: {
              from: "authorization",
              localField: "listener_job_details.resource_ref.resource_id",
              foreignField: "dataset_id",
              as: "auth",
            },
          },
        ],
        extraction_on_file: [
          {
            $match: {
              "listener_job_details.resource_ref.collection": {
                $eq: "file",
              },
            },
          },
          {
            $lookup: {
              from: "files",
              localField: "listener_job_details.resource_ref.resource_id",
              foreignField: "_id",
              as: "file_details",
            },
          },
          {
            $lookup: {
              from: "authorization",
              localField: "file_details.dataset_id",
              foreignField: "dataset_id",
              as: "auth",
            },
          },
        ],
      },
    },
    {
      $project: {
        all: {
          $concatArrays: ["$extraction_on_dataset", "$extraction_on_file"],
        },
      },
    },
    {
      $unwind: "$all",
    },
    {
      $replaceRoot: {
        newRoot: "$all",
      },
    },
  ]);

  db.createView("listener_jobs_view", "listener_jobs", [
    {
      $facet: {
        extraction_on_dataset: [
          {
            $match: {
              "resource_ref.collection": {
                $eq: "dataset",
              },
            },
          },
          {
            $lookup: {
              from: "authorization",
              localField: "resource_ref.resource_id",
              foreignField: "dataset_id",
              as: "auth",
            },
          },
        ],
        extraction_on_file: [
          {
            $match: {
              "resource_ref.collection": {
                $eq: "file",
              },
            },
          },
          {
            $lookup: {
              from: "files",
              localField: "resource_ref.resource_id",
              foreignField: "_id",
              as: "file_details",
            },
          },
          {
            $lookup: {
              from: "authorization",
              localField: "file_details.dataset_id",
              foreignField: "dataset_id",
              as: "auth",
            },
          },
        ],
      },
    },
    {
      $project: {
        all: {
          $concatArrays: ["$extraction_on_dataset", "$extraction_on_file"],
        },
      },
    },
    {
      $unwind: "$all",
    },
    {
      $replaceRoot: {
        newRoot: "$all",
      },
    },
  ]);

  db.createView("metadata_view", "metadata", [
    {
      $facet: {
        metadata_on_dataset: [
          {
            $match: {
              "resource.collection": {
                $eq: "datasets",
              },
            },
          },
          {
            $lookup: {
              from: "authorization",
              localField: "resource.resource_id",
              foreignField: "dataset_id",
              as: "auth",
            },
          },
        ],
        metadata_on_file: [
          {
            $match: {
              "resource.collection": {
                $eq: "files",
              },
            },
          },
          {
            $lookup: {
              from: "files",
              localField: "resource.resource_id",
              foreignField: "_id",
              as: "file_details",
            },
          },
          {
            $lookup: {
              from: "authorization",
              localField: "file_details.dataset_id",
              foreignField: "dataset_id",
              as: "auth",
            },
          },
        ],
      },
    },
    {
      $project: {
        all: {
          $concatArrays: ["$metadata_on_dataset", "$metadata_on_file"],
        },
      },
    },
    {
      $unwind: "$all",
    },
    {
      $replaceRoot: {
        newRoot: "$all",
      },
    },
  ]);
}

init("clowder2");
init("clowder-tests");
