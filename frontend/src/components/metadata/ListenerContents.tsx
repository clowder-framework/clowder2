import React from "react";
import {Box, Typography} from "@mui/material";
import {theme} from "../../theme";
import {parseDate} from "../../utils/common";

const textStyle = {
	fontWeight: "normal",
	fontSize: "10px",
	fontStyle: "italic",
	color: theme.palette.secondary.light,
};

type ListenerContentsEntry = {
	contents: any,
}



export const ListenerContents = (props: ListenerContentsEntry) => {
	const {contents} = props;
	// console.log(contents, 'are the contents');
	// console.log(typeof(contents));

	return <div><pre>{JSON.stringify(contents, null, 2)}</pre></div>

	// return Object.entries(contents).map(([key, value], idx) => {
	// 	// console.log('objectKey', objectKey)
	// 	// console.log(key, 'key');
	// 	// console.log(value, typeof(value), 'value');
	// 	if (typeof(value) == 'object') {
	// 		// console.log("value is an object");
	// 		// console.log(objectKey, key, value);
	// 		//
	// 		console.log(idx, objectKey, key, value);
	// 		let currentKey = key
	// 		let entry = currentKey + ': ' + 'value goes here'
	// 		return <li>{entry}</li>
	//
	//
	// 	} else {
	// 		if (objectKey !== undefined) {
	// 			console.log("objectKey is not undefined", objectKey);
	// 			console.log(value);
	// 		}
	// 		let entry = key + ": " +value
	// 		return <li>{entry}</li>
	// 	}
	// });
}
