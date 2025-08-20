import { V2 } from "./openapi";
import { EventListenerJobStatus } from "./types/data";

interface Config {
	appVersion: string;
	mailingList: string;
	slackChannel: string;
	documentation: string;
	hostname: string;
	apikey: string;
	GHIssueBaseURL: string;
	jupyterHubURL: string;
	KeycloakBaseURL: string;
	KeycloakLogin: string;
	KeycloakLogout: string;
	KeycloakRefresh: string;
	KeycloakRegister: string;
	searchEndpoint: string;
	publicSearchEndpoint: string;
	refreshTokenInterval: number;
	extractorStatusInterval: number;
	extractorLivelihoodInterval: number;
	eventListenerJobStatus: EventListenerJobStatus;
	streamingBytes: number;
	rawDataVisualizationThreshold: number;
	defaultFolderFilePerPage: number;
	defaultDatasetPerPage: number;
	defaultGroupPerPage: number;
	defaultUserPerPage: number;
	defaultApikeyPerPage: number;
	defaultExtractors: number;
	defaultFeeds: number;
	defaultExtractionJobs: number;
	defaultMetadataDefintionPerPage: number;
	defaultVersionPerPage: number;
}

const config: Config = <Config>{};
const hostname =
	process.env.CLOWDER_REMOTE_HOSTNAME ||
	`${window.location.protocol}//${window.location.host}`;

// TODO when add auth piece remove this env
const apikey = process.env.APIKEY || "";
config["appVersion"] = "v2.0.0-beta.3";
config["mailingList"] = "clowder@lists.illinois.edu";
config["slackChannel"] =
	"https://join.slack.com/t/clowder-software/shared_invite/enQtMzQzOTg0Nzk3OTUzLTYwZDlkZDI0NGI4YmI0ZjE5MTZiYmZhZTIyNWE1YzM0NWMwMzIxODNhZTA1Y2E3MTQzOTg1YThiNzkwOWQwYWE";
config["documentation"] = "https://clowder2.readthedocs.io/en/latest/";
config["hostname"] = hostname;
config["apikey"] = apikey;

V2.OpenAPI.BASE = config.hostname;

config["GHIssueBaseURL"] =
	"https://github.com/clowder-framework/clowder2/issues/new?title=%5BClowder+V2%5D";

// Backend Keycloak login url
config["KeycloakBaseURL"] =
	process.env.KeycloakBaseURL || `${config.hostname}/api/v2/auth`;
config["KeycloakLogin"] = `${config.KeycloakBaseURL}/login`;
config["KeycloakLogout"] = `${config.KeycloakBaseURL}/logout`;
config["KeycloakRefresh"] = `${config.KeycloakBaseURL}/refresh_token`;
config["KeycloakRegister"] = `${config.KeycloakBaseURL}/register`;

// elasticsearch
config["searchEndpoint"] = `${hostname}/api/v2/elasticsearch`;
config["publicSearchEndpoint"] = `${hostname}/api/v2/public_elasticsearch`;

// jupterhub
const localJupyterhubURL: string = `${config.hostname}/jupyterhub`;
config["jupyterHubURL"] = process.env.JUPYTERHUB_URL || localJupyterhubURL;

// refresh token time interval
config["refreshTokenInterval"] = 1000 * 60; // 1 minute
// updated extractor logs
config["extractorStatusInterval"] = 1000 * 10; // 10 seconds
// update extractor stutus (offline/online)
config["extractorLivelihoodInterval"] = 1000 * 120; // 2 minutes

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

config["defaultDatasetPerPage"] = 12;
config["defaultFolderFilePerPage"] = 5;
config["defaultGroupPerPage"] = 5;
config["defaultUserPerPage"] = 5;
config["defaultApikeyPerPage"] = 5;
config["defaultExtractors"] = 5;
config["defaultFeeds"] = 5;
config["defaultExtractionJobs"] = 5;
config["defaultMetadataDefintionPerPage"] = 5;
config["defaultVersionPerPage"] = 3;

export default config;
