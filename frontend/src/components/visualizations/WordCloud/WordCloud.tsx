import React, { useEffect, useState } from "react";
import { VegaLite } from "react-vega";
import { downloadVisData, fileDownloaded } from "../../../utils/visualization";
import {
	guessDataType,
	parseTextToJson,
	readTextFromFile,
} from "../../../utils/common";
import { Box, Container, Grid, MenuItem, Select } from "@mui/material";
import { ClowderInputLabel } from "../../styledComponents/ClowderInputLabel";
import { theme } from "../../../theme";

type TextProps = {
	fileId?: string;
	visualizationId?: string;
};

const allowedType = [
	"quantitative",
	"temporal",
	"ordinal",
	"nominal",
	"geojson",
];

export default function WordCloud(props: TextProps) {
	let { fileId, visualizationId } = props;
	const [data, setData] = useState();

	useEffect(() => {
		const processBlob = async () => {
			try {
				let blob;
				if (visualizationId) {
					blob = await downloadVisData(visualizationId);
				} else {
					blob = await fileDownloaded(fileId, 0);
				}
				const file = new File([blob], "text.tmp");
				const reader = new FileReader();
				reader.onload = function (e) {
				  try {
					const jsonData = JSON.parse(e.target.result);
					setData(jsonData);
					console.debug('JSON data from file:', jsonData);
				  } catch (error) {
					console.error('Error parsing JSON:', error);
				  }
				};
				const text = await reader.readAsText(file);
				console.debug(text);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		processBlob();
	}, [visualizationId, fileId]);


	return (
			<Container sx={{ marginTop: "2em"}}>
				{data && <VegaLite spec={data} />}
			</Container>
	);
}
