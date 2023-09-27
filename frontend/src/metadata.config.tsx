import React from "react";
import { MetadataTextField } from "./components/metadata/widgets/MetadataTextField";
import { MetadataDateTimePicker } from "./components/metadata/widgets/MetadataDateTimePicker";
import { MetadataSelect } from "./components/metadata/widgets/MetadataSelect";

export const metadataConfig = {
	TextField: <MetadataTextField />,
	DateTimePicker: <MetadataDateTimePicker />,
	Select: <MetadataSelect />,
	// TODO need to write a fallback
	NA: <MetadataTextField />,
};

export interface InputType {
	name: string;
	description: string;
}

interface WidgetType {
	name: string;
	description: string;
	input_types: Array<InputType>;
}

interface WidgetTypes {
	[key: string]: WidgetType;
}
export const widgetTypes: WidgetTypes = {
	TextField: {
		name: "TextField",
		description: "Text Input",
		input_types: [
			{
				name: "int",
				description: "Integer",
			},
			{
				name: "float",
				description: "Floating point",
			},
			{
				name: "str",
				description: "String",
			},
			{
				name: "bool",
				description: "Boolean",
			},
			{
				name: "dict",
				description: "Dictionary",
			},
			{
				name: "tuple",
				description: "Tuple",
			},
		],
	},
	DateTimePicker: {
		name: "DateTimePicker",
		description: "Date Time Picker",
		input_types: [
			{
				name: "date",
				description: "Date",
			},
			{
				name: "time",
				description: "Time",
			},
		],
	},
	Select: {
		name: "Select",
		description: "Dropdown",
		input_types: [
			{
				name: "enum",
				description: "List",
			},
		],
	},
};

export const contextUrlMap = {
	frequently_used: [
		{
			name: "abstract",
			url: "http://purl.org/dc/terms/abstract",
		},
		{
			name: "point",
			url: "https://schema.org/point",
		},
		{
			name: "DigitalDocument",
			url: "https://schema.org/DigitalDocument",
		},
		{
			name: "longitude",
			url: "https://schema.org/longitude",
		},
		{
			name: "latitude",
			url: "https://schema.org/latitude",
		},
		{
			name: "QuantitativeValue",
			url: "https://schema.org/QuantitativeValue",
		},
	],
};
