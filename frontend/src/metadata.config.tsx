import React from "react";
import {AlternativeTitle} from "./components/metadata/AlternativeTitle";
import {DOI} from "./components/metadata/DOI";
import {Time} from "./components/metadata/Time";
import {Unit} from "./components/metadata/Unit";
import {LatLon} from "./components/metadata/LatLon";
import {MetadataTextField} from "./components/metadata/widgets/MetadataTextField";
import {MetadataDateTimePicker} from "./components/metadata/widgets/MetadataDateTimePicker";
import {MetadataSelect} from "./components/metadata/widgets/MetadataSelect";

const configMetadata = {
	"AlternativeTitle": <AlternativeTitle/>,
	"DOI":<DOI/>,
	"Time": <Time/>,
	"Unit": <Unit/>,
	"LatLon": <LatLon/>,
	"TextField": <MetadataTextField />,
	"DateTimePicker": <MetadataDateTimePicker />,
	"Select": <MetadataSelect />,
	// TODO need to write a fallback
	"NA": <MetadataTextField />
};

export default configMetadata
