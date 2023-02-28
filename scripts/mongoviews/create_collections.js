db = db.getSiblingDB("clowder2");

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
