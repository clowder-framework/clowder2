import React from "react";
import {MetadataTextField} from "./components/metadata/widgets/MetadataTextField";
import {MetadataDateTimePicker} from "./components/metadata/widgets/MetadataDateTimePicker";
import {MetadataSelect} from "./components/metadata/widgets/MetadataSelect";

export const metadataConfig = {
	"TextField": <MetadataTextField />,
	"DateTimePicker": <MetadataDateTimePicker />,
	"Select": <MetadataSelect />,
	// TODO need to write a fallback
	"NA": <MetadataTextField />
};

export const inputTypes = {
    "int": "Integer",
    "float": "Floating point",
    "str": "String",
    "bool": "Boolean",
    "date": "Date",
    "time": "Time",
    "dict": "Dictionary",
    "enum": "List",
    "tuple": "Tuple"
}

export const widgetTypes ={
    "TextField": "Text Input",
    "DateTimePicker": "Date Time Picker",
    "Select": "Dropdown"
}
