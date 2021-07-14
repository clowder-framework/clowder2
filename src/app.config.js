let apiprotocol = "https";

let config;
let apihost;
let apiurl;

if (process.env.DEPLOY_ENV === "production") {
	apihost = "incore.ncsa.illinois.edu";
	apiurl = `${apiprotocol}://${apihost}`;
	config = {
		baseUrlRoute: "playbook",
		geoServerWMS: "https://incore-geoserver.ncsa.illinois.edu/geoserver/incore/wms",
		geoServerWFS: "https://incore-geoserver.ncsa.illinois.edu/geoserver/incore/ows",
	};
} else if (process.env.DEPLOY_ENV === "test") {
	apihost = "incore-tst.ncsa.illinois.edu";
	apiurl = `${apiprotocol}://${apihost}`;
	config = {
		baseUrlRoute: "playbook",
		geoServerWMS: "https://incore-tst.ncsa.illinois.edu/geoserver/incore/wms",
		geoServerWFS: "https://incore-tst.ncsa.illinois.edu/geoserver/incore/ows",
	};
} else if (process.env.DEPLOY_ENV === "local") {
	apihost = "localhost:8080";
	apiurl = `http://${apihost}`;
	config = {
		baseUrlRoute: "",
		geoServerWMS: "https://incore-tst.ncsa.illinois.edu/geoserver/incore/wms",
		geoServerWFS: "https://incore-tst.ncsa.illinois.edu/geoserver/incore/ows",
	};
} else if (process.env.DEPLOY_ENV === "development") {
	apihost = "incore-dev.ncsa.illinois.edu";
	apiurl = `${apiprotocol}://${apihost}`;
	config = {
		baseUrlRoute: "playbook",
		geoServerWMS: "https://incore-dev.ncsa.illinois.edu/geoserver/incore/wms",
		geoServerWFS: "https://incore-dev.ncsa.illinois.edu/geoserver/incore/ows",
	};
} else { // default case that used dev environment
	apihost = "";
	apiurl = "";
	config = {
		baseUrlRoute: "playbook",
		geoServerWMS: "/geoserver/incore/wms",
		geoServerWFS: "https://incore-geoserver.ncsa.illinois.edu/geoserver/incore/ows",
	};
}
config["apiUrl"] = apiurl;
config["dataWolf"] = "https://incore-tst.ncsa.illinois.edu/datawolf/";
config["client_id"] = "react-auth";
config["authService"] = `${apiurl}/auth/realms/In-core/protocol/openid-connect/token`;
config["testUserInfo"] = "commresilience";
config["hazardServiceBase"] = `${apiurl}/hazard/api/`;

config["dataServiceBase"] = `${apiurl}/data/api/`;


export default config;
