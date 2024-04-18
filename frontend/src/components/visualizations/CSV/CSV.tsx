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
import { downloadPublicVisData } from "../../../actions/public_visualization";
import { filePublicDownloaded } from "../../../actions/public_file";

type TextProps = {
	fileId?: string;
	visualizationId?: string;
	publicView?: boolean | false;
};

const allowedType = [
	"quantitative",
	"temporal",
	"ordinal",
	"nominal",
	"geojson",
];

export default function CSV(props: TextProps) {
	const { fileId, visualizationId, publicView } = props;
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
					if (publicView) {
						blob = await downloadPublicVisData(visualizationId);
					} else {
						blob = await downloadVisData(visualizationId);
					}
				} else {
					if (publicView) {
						blob = await filePublicDownloaded(fileId);
					} else {
						blob = await fileDownloaded(fileId, 0);
					}
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
		mark: { type: mark, color: theme.palette.primary.main },
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
			<Grid container className="inputGroup">
				<Grid item xs={6}>
					<ClowderInputLabel id="plotType">X Axis</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={xColumn}
						label="Role"
						onChange={(e) => {
							setXColumn(e.target.value);
						}}
						sx={{ width: "90%" }}
					>
						{availableColumns.map((column) => {
							return <MenuItem value={column}>{column}</MenuItem>;
						})}
					</Select>
				</Grid>
				<Grid item xs={6}>
					<ClowderInputLabel id="plotType">X Axis Type</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={xColumnType}
						label="Role"
						onChange={(e) => {
							setXColumnType(e.target.value);
						}}
						sx={{ width: "90%" }}
					>
						{allowedType.map((type) => {
							return <MenuItem value={type}>{type}</MenuItem>;
						})}
					</Select>
				</Grid>
			</Grid>
			<Grid container className="inputGroup">
				<Grid item xs={6}>
					<ClowderInputLabel id="plotType">Y Axis</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={yColumn}
						label="Role"
						onChange={(e) => {
							setYColumn(e.target.value);
						}}
						sx={{ width: "90%" }}
					>
						{availableColumns.map((column) => {
							return <MenuItem value={column}>{column}</MenuItem>;
						})}
					</Select>
				</Grid>
				<Grid item xs={6}>
					<ClowderInputLabel id="plotType">Y Axis Type</ClowderInputLabel>
					<Select
						labelId="role"
						id="role"
						value={yColumnType}
						label="Role"
						onChange={(e) => {
							setYColumnType(e.target.value);
						}}
						sx={{ width: "90%" }}
					>
						{allowedType.map((type) => {
							return <MenuItem value={type}>{type}</MenuItem>;
						})}
					</Select>
				</Grid>
			</Grid>
			<Container sx={{ marginTop: "2em" }}>
				<VegaLite spec={spec} data={data} />
			</Container>
		</>
	);
}
