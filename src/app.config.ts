let config = {};
let hostname = process.env.CLOWDER_REMOTE_HOSTNAME || "";

// TODO when add auth piece remove this env
let apikey = process.env.APIKEY;

config["hostname"] = hostname;
config["apikey"] = apikey;

export default config;
