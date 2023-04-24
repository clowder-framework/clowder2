import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Grid, IconButton } from "@mui/material";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import { Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Layout from "../Layout";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";

import { listApiKeys as listApiKeysAction } from "../../actions/user";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme } from "../../theme";

export function ApiKeys() {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listApiKeys = (skip: number | undefined, limit: number | undefined) =>
		dispatch(listApiKeysAction(skip, limit));
	// const deleteApiKey = (keyId: string) => dispatch(deleteApiKeyAction(keyId));

	const apikeys = useSelector((state: RootState) => state.user.apikeys);

	// TODO add option to determine limit number; default show 5 groups each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>(0);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedApikey, setSelectApikey] = useState("");
	const [deleteApikeyConfirmOpen, setDeleteApikeyConfirmOpen] = useState(false);

	// for breadcrumb
	const paths = [
		{
			name: "Explore",
			url: "/",
		},
	];

	// component did mount
	useEffect(() => {
		listApiKeys(skip, limit);
	}, []);

	useEffect(() => {
		// disable flipping if reaches the last page
		if (apikeys.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [apikeys]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listApiKeys(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	// delete
	// const handleDelete = () => {
	// 	deleteApiKey();
	// };

	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (apikeys.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	return (
		<Layout>
			{/*breadcrumb*/}
			<Grid container>
				<Grid item xs={10} sx={{ display: "flex", alignItems: "center" }}>
					<MainBreadcrumbs paths={paths} />
				</Grid>
			</Grid>
			<br />
			<Grid container>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>API Key Name</TableCell>
								<TableCell align="right">Created at</TableCell>
								<TableCell align="right">Expired at</TableCell>
								<TableCell align="right"></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{apikeys.map((apikey) => {
								return (
									<TableRow
										key={apikey.id}
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell component="th" scope="row" key={apikey.id}>
											<Button component={Link} to={`/groups/${apikey.id}`}>
												{apikey.name}
											</Button>
										</TableCell>
										<TableCell
											component="th"
											scope="row"
											key={apikey.id}
											align="right"
										>
											{apikey.created}
										</TableCell>
										<TableCell
											component="th"
											scope="row"
											key={apikey.id}
											align="right"
										>
											{apikey.expires}
										</TableCell>
										<TableCell align="right">
											<IconButton
												type="button"
												sx={{ p: "10px" }}
												aria-label="delete"
												onClick={() => {
													setSelectApikey(apikey.id);
													setDeleteApikeyConfirmOpen(true);
												}}
											>
												<DeleteIcon
													sx={{
														verticalAlign: "middle",
														color: theme.palette.primary.main,
													}}
												/>
											</IconButton>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
					<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
						<ButtonGroup variant="contained" aria-label="previous next buttons">
							<Button
								aria-label="previous"
								onClick={previous}
								disabled={prevDisabled}
							>
								<ArrowBack /> Prev
							</Button>
							<Button aria-label="next" onClick={next} disabled={nextDisabled}>
								Next <ArrowForward />
							</Button>
						</ButtonGroup>
					</Box>
				</TableContainer>
			</Grid>
		</Layout>
	);
}
