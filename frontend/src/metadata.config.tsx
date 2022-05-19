import React from "react";
import {AlternativeTitle} from "./components/metadata/AlternativeTitle";
import {DOI} from "./components/metadata/DOI";
import {Time} from "./components/metadata/Time";
import {Unit} from "./components/metadata/Unit";
import {LatLon} from "./components/metadata/LatLon";

const configMetadata = {
	"alternative_title": <AlternativeTitle/>,
	"doi":<DOI/>,
	"time": <Time/>,
	"unit": <Unit/>,
	"LatLon": <LatLon/>,
	// "color": <Color/>
};

export default configMetadata
