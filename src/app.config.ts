interface Config{
	hostname: string;
	apikey: string;
}

const config:Config = <Config>{};
const hostname = process.env.CLOWDER_REMOTE_HOSTNAME || "";

// TODO when add auth piece remove this env
const apikey = process.env.APIKEY || "";

config["hostname"] = hostname;
config["apikey"] = apikey;

export default config;
