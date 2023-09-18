import React, { useEffect, useState } from "react";
import { VegaLite } from "react-vega";
import { downloadVisData, fileDownloaded } from "../../../utils/visualization";
import {
	guessDataType,
	parseTextToJson,
	readTextFromFile,
} from "../../../utils/common";
import { Box, Container, MenuItem, Select } from "@mui/material";
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

export default function CSV(props: TextProps) {
	const { fileId, visualizationId } = props;
	const [mark, setMark] = useState("bar");
	// TODO default to the first two columns
	const [availableColumns, setAvailableColumns] = useState<string[]>([]);
	const [xColumn, setXColumn] = useState("");
	const [yColumn, setYColumn] = useState("");
	const [xColumnType, setXColumnType] = useState(allowedType[0]);
	const [yColumnType, setYColumnType] = useState(allowedType[0]);

	// const [width, setWidth] = useState(900);
	// const [height, setHeight] = useState(900);
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

	useEffect(() => {
		if (data && data.table && data.table.length > 0) {
			// Assuming the first row of the table contains column headers
			const firstRow = data.table[0];

			// Extract column names from the first row
			setAvailableColumns(Object.keys(firstRow));
		}
	}, [data]);

	useEffect(() => {
		if (availableColumns.length > 0) {
			setXColumn(availableColumns[0]);
			setXColumnType(guessDataType(data.table[0][availableColumns[0]]));
			setYColumn(availableColumns[0]);
			setYColumnType(guessDataType(data.table[0][availableColumns[0]]));
		}
	}, [availableColumns]);

	const spec = {
		// width: width,
		// height: height,
		mark: mark,
		encoding: {
			x: {
				field: xColumn,
				type: xColumnType,
			},
			y: {
				field: yColumn,
				type: yColumnType,
				axis: {
					labelLimit: 50,
				},
			},
		},
		data: { name: "table" },
		color: { value: theme.palette.primary.main },
	};

	return (
		<>
			<Box className="inputGroup">
				<ClowderInputLabel id="plotType">Plot Type</ClowderInputLabel>
				<Select
					labelId="role"
					id="role"
					value={mark}
					label="Role"
					onChange={(e) => {
						setMark(e.target.value);
					}}
					sx={{ width: "100%" }}
				>
					<MenuItem value={"bar"}>Bar Chart</MenuItem>
					<MenuItem value={"point"}>Scatter Plot</MenuItem>
					<MenuItem value={"line"}>Line Chart</MenuItem>
				</Select>
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-start",
				}}
				className="inputGroup"
			>
				<Box sx={{ marginRight: "1em" }}>
					<ClowderInputLabel id="plotType">X Axis</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={xColumn}
						label="Role"
						onChange={(e) => {
							setXColumn(e.target.value);
						}}
					>
						{availableColumns.map((column) => {
							return <MenuItem value={column}>{column}</MenuItem>;
						})}
					</Select>
				</Box>
				<Box>
					<ClowderInputLabel id="plotType">X Axis Type</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={xColumnType}
						label="Role"
						onChange={(e) => {
							setXColumnType(e.target.value);
						}}
					>
						{allowedType.map((type) => {
							return <MenuItem value={type}>{type}</MenuItem>;
						})}
					</Select>
				</Box>
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-start",
				}}
				className="inputGroup"
			>
				<Box sx={{ marginRight: "1em" }}>
					<ClowderInputLabel id="plotType">Y Axis</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={yColumn}
						label="Role"
						onChange={(e) => {
							setYColumn(e.target.value);
						}}
					>
						{availableColumns.map((column) => {
							return <MenuItem value={column}>{column}</MenuItem>;
						})}
					</Select>
				</Box>
				<Box>
					<ClowderInputLabel id="plotType">Y Axis Type</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={yColumnType}
						label="Role"
						onChange={(e) => {
							setYColumnType(e.target.value);
						}}
					>
						{allowedType.map((type) => {
							return <MenuItem value={type}>{type}</MenuItem>;
						})}
					</Select>
				</Box>
			</Box>
			<Container sx={{ marginTop: "2em" }}>
				<VegaLite spec={spec} data={data} />
			</Container>
		</>
	);
}
