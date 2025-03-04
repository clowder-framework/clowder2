import React, {useEffect} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {useNavigate} from "react-router-dom";
import {theme} from "../../theme";
import {useDispatch} from "react-redux";
import {DatsetTableEntry} from "../datasets/DatasetTableEntry";

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export default function ProjectTable(props) {
	const {project} = props;

	// useNavigate hook for navigation
	const navigate = useNavigate();

	const dispatch = useDispatch();

	useEffect(() => {
		if (project) {
			if (project.dataset_ids) {
				listDatasets(project.dataset_ids);
			}
			if (project.file_ids) {
				listFiles(project.file_ids);
			}
		}
	}, [project]);

	return (
		<TableContainer component={Paper}>
			<Table sx={{minWidth: 650}} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell align="right">Created</TableCell>
						<TableCell align="right">Size</TableCell>
						<TableCell align="right">Type</TableCell>
						<TableCell align="right"/>
					</TableRow>
				</TableHead>
				<TableBody />
			</Table>
		</TableContainer>
	);
}
