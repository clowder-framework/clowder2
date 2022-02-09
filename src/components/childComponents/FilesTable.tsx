import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {useNavigate} from "react-router-dom";
import {Button, Link} from "@mui/material";
import FileMenu from "./FileMenu";

type FilesTableProps = {
	datasetId: string | undefined,
	datasetName: string
}

export default function FilesTable(props: FilesTableProps) {
	// mapStateToProps
	const filesInDataset = useSelector((state:RootState) => state.dataset.files);
	// use history hook to redirect/navigate between routes
	const history = useNavigate();
	const selectFile = (selectedFileId: string) => {
		// Redirect to file route with file Id and dataset id
		history(`/files/${selectedFileId}?dataset=${props.datasetId}&name=${props.datasetName}`);
	};
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell align="right">Creator</TableCell>
						<TableCell align="right">Size</TableCell>
						<TableCell align="right">Type</TableCell>
						<TableCell align="right"></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{
						filesInDataset.map((file) => (
						<TableRow
							key={file.id}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<TableCell component="th" scope="row">
								<Button onClick={() => selectFile(file.id)}>{file.name}</Button>
							</TableCell>
							<TableCell align="right">{file.creator}</TableCell>
							<TableCell align="right">{file.size}</TableCell>
							<TableCell align="right">{file.contentType}</TableCell>
							<TableCell align="right"><FileMenu file={file}/></TableCell>
						</TableRow>))
					}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
