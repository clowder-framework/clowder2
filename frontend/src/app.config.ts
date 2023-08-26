import { V2 } from "./openapi";
import { EventListenerJobStatus } from "./types/data";

interface Config {
	hostname: string;
	apikey: string;
	GHIssueBaseURL: string;
	KeycloakBaseURL: string;
	KeycloakLogin: string;
	KeycloakLogout: string;
	KeycloakRefresh: string;
	KeycloakRegister: string;
	searchEndpoint: string;
	refreshTokenInterval: number;
	extractorInterval: number;
	eventListenerJobStatus: EventListenerJobStatus;
	streamingBytes: number;
	rawDataVisualizationThreshold: number;
}

const config: Config = <Config>{};
const hostname =
	process.env.CLOWDER_REMOTE_HOSTNAME ||
	`${window.location.protocol}//${window.location.host}`;

// TODO when add auth piece remove this env
const apikey = process.env.APIKEY || "";

config["hostname"] = hostname;
config["apikey"] = apikey;

V2.OpenAPI.BASE = config.hostname;

config["GHIssueBaseURL"] =
	"https://github.com/clowder-framework/clowder2/issues/new?title=%5BClowder+V2%5D";

// Backend Keycloak login url
config["KeycloakBaseURL"] =
	process.env.KeycloakBaseURL || config.hostname + "/api/v2/auth";
config["KeycloakLogin"] = config.KeycloakBaseURL + "/login";
config["KeycloakLogout"] = config.KeycloakBaseURL + "/logout";
config["KeycloakRefresh"] = config.KeycloakBaseURL + "/refresh_token";
config["KeycloakRegister"] = config.KeycloakBaseURL + "/register";

// elasticsearch
config["searchEndpoint"] = `${hostname}/api/v2/elasticsearch`;

// refresh toekn time interval
config["refreshTokenInterval"] = 1000 * 60; // milliseconds
config["extractorInterval"] = 2000; // milliseconds

config["eventListenerJobStatus"] = <EventListenerJobStatus>{};
config["eventListenerJobStatus"]["created"] = "CREATED";
config["eventListenerJobStatus"]["started"] = "STARTED";
config["eventListenerJobStatus"]["processing"] = "PROCESSING";
config["eventListenerJobStatus"]["succeeded"] = "SUCCEEDED";
config["eventListenerJobStatus"]["error"] = "ERROR";
config["eventListenerJobStatus"]["skipped"] = "SKIPPED";
config["eventListenerJobStatus"]["resubmitted"] = "RESUBMITTED";

config["streamingBytes"] = 1024 * 10; // 10 MB?
config["rawDataVisualizationThreshold"] = 1024 * 1024 * 10; // 10 MB

export default config;
