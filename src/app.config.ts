import {V2} from "./openapi";

interface Config{
	hostname: string;
	apikey: string;
	GHIssueBaseURL: string;
	KeycloakLogin: string;
}

const config:Config = <Config>{};
const hostname = process.env.CLOWDER_REMOTE_HOSTNAME || "";

// TODO when add auth piece remove this env
const apikey = process.env.APIKEY || "";

config["hostname"] = hostname;
config["apikey"] = apikey;

V2.OpenAPI.BASE = config.hostname;

config["GHIssueBaseURL"] = "https://github.com/clowder-framework/clowder2-frontend/issues/new?title=%5BClowder+V2%5D";

// Backend Keycloak login url
config["KeycloakLogin"] = "http://localhost:8000/api/v2/auth/login";

export default config;
