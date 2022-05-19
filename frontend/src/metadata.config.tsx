import React from "react";
import {AlternativeTitle} from "./components/metadata/AlternativeTitle";
import {DOI} from "./components/metadata/DOI";
import {Time} from "./components/metadata/Time";
import {Unit} from "./components/metadata/Unit";

const configMetadata = {
	"alternative_title": <AlternativeTitle/>,
	"doi":<DOI/>,
	"time": <Time/>,
	"unit": <Unit/>
};

export default configMetadata
