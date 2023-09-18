import React, { useEffect, useState } from "react";
import { VegaLite } from "react-vega";
import { downloadVisData, fileDownloaded } from "../../../utils/visualization";
import { parseTextToJson, readTextFromFile } from "../../../utils/common";

type TextProps = {
	fileId?: string;
	visualizationId?: string;
};

export default function CSV(props: TextProps) {
	const { fileId, visualizationId } = props;
	const [text, setText] = useState("");
	const [width, setWidth] = useState(900);
	const [height, setHeight] = useState(900);
	const [startAtZero, setStartAtZero] = useState(false);
	// const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	// const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [yLabel, setYLabel] = useState("");
	const [regressionLine, setRegressionLine] = useState(false);
	const [data, setData] = useState<any[]>([]);

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
				const text = await readTextFromFile(file);
				setData({ table: await parseTextToJson(text) });
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		processBlob();
	}, [visualizationId, fileId]);

	const spec = {
		width: 400,
		height: 200,
		mark: "bar",
		encoding: {
			x: { field: "a", type: "ordinal" },
			y: { field: "b", type: "quantitative" },
		},
		data: { name: "table" },
	};

	return <VegaLite spec={spec} data={data} />;
}
