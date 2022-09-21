import React from "react";
import {MetadataTextField} from "./components/metadata/widgets/MetadataTextField";
import {MetadataDateTimePicker} from "./components/metadata/widgets/MetadataDateTimePicker";
import {MetadataSelect} from "./components/metadata/widgets/MetadataSelect";

const configMetadata = {
	"TextField": <MetadataTextField />,
	"DateTimePicker": <MetadataDateTimePicker />,
	"Select": <MetadataSelect />,
	// TODO need to write a fallback
	"NA": <MetadataTextField />
};

export default configMetadata
