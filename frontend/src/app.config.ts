import {V2} from "./openapi";

interface Config{
	hostname: string;
	apikey: string;
	GHIssueBaseURL: string;
	KeycloakBaseURL: string;
	KeycloakLogin: string;
	KeycloakLogout: string;
	KeycloakRefresh: string;
	KeycloakRegister: string;
}

const config:Config = <Config>{};
const hostname = process.env.CLOWDER_REMOTE_HOSTNAME || "";

// TODO when add auth piece remove this env
const apikey = process.env.APIKEY || "";

config["hostname"] = hostname;
config["apikey"] = apikey;

V2.OpenAPI.BASE = config.hostname;

config["GHIssueBaseURL"] = "https://github.com/clowder-framework/clowder2/issues/new?title=%5BClowder+V2%5D";

// Backend Keycloak login url
config["KeycloakBaseURL"] = process.env.KeycloakBaseURL || config.hostname + "/api/v2/auth";
config["KeycloakLogin"] = config.KeycloakBaseURL + "/login";
config["KeycloakLogout"] = config.KeycloakBaseURL + "/logout";
config["KeycloakRefresh"] = config.KeycloakBaseURL + "/refresh_token";
config["KeycloakRegister"] = config.KeycloakBaseURL + "/register";

export default config;
