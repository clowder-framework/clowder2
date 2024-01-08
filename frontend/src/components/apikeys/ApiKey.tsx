import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Grid, IconButton } from "@mui/material";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Layout from "../Layout";

import {
	deleteApiKey as deleteApiKeyAction,
	listApiKeys as listApiKeysAction,
} from "../../actions/user";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme } from "../../theme";
import { parseDate } from "../../utils/common";
import { ActionModal } from "../dialog/ActionModal";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { CreateApiKeyModal } from "./CreateApiKeyModal";

export function ApiKeys() {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listApiKeys = (skip: number | undefined, limit: number | undefined) =>
		dispatch(listApiKeysAction(skip, limit));
	const deleteApiKey = (keyId: string) => dispatch(deleteApiKeyAction(keyId));

	const apiKeys = useSelector((state: RootState) => state.user.apiKeys);

	// TODO add option to determine limit number; default show 5 tokens each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit] = useState<number>(5);
	const [skip, setSkip] = useState<number | undefined>(0);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedApikey, setSelectApikey] = useState("");
	const [deleteApikeyConfirmOpen, setDeleteApikeyConfirmOpen] = useState(false);
	const [createApiKeyModalOpen, setCreateApiKeyModalOpen] = useState(false);

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
		if (apiKeys.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [apiKeys]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listApiKeys(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (apiKeys.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	return (
		<Layout>
			{/*breadcrumb*/}
			<Grid container>
				<Grid item xs={8} sx={{ display: "flex", alignItems: "center" }} />
				<Grid item xs={4}>
					<Button
						variant="contained"
						onClick={() => {
							setCreateApiKeyModalOpen(true);
						}}
						endIcon={<VpnKeyIcon />}
						sx={{ float: "right" }}
					>
						New API Key
					</Button>
				</Grid>
			</Grid>
			<br />
			<Grid container>
				{/*action modal*/}
				<ActionModal
					actionOpen={deleteApikeyConfirmOpen}
					actionTitle="Are you sure?"
					actionText="Do you really want to delete this API Key? This process cannot be undone."
					actionBtnName="Delete"
					handleActionBtnClick={() => {
						deleteApiKey(selectedApikey);
						setDeleteApikeyConfirmOpen(false);
					}}
					handleActionCancel={() => {
						setDeleteApikeyConfirmOpen(false);
					}}
				/>
				{/*create api key modal*/}
				<CreateApiKeyModal
					skip={skip}
					limit={limit}
					apiKeyModalOpen={createApiKeyModalOpen}
					setApiKeyModalOpen={setCreateApiKeyModalOpen}
				/>
				{/*api key table*/}
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>API Key Name</TableCell>
								<TableCell align="right">Created at</TableCell>
								<TableCell align="right">Expired at</TableCell>
								<TableCell align="right" />
							</TableRow>
						</TableHead>
						<TableBody>
							{apiKeys.map((apiKey) => {
								return (
									<TableRow
										key={apiKey.id}
										sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
									>
										<TableCell
											component="th"
											scope="row"
											key={apiKey.id}
											sx={{ textTransform: "uppercase" }}
										>
											{apiKey.name}
										</TableCell>
										<TableCell
											component="th"
											scope="row"
											key={apiKey.id}
											align="right"
										>
											{parseDate(apiKey.created)}
										</TableCell>
										<TableCell
											component="th"
											scope="row"
											key={apiKey.id}
											align="right"
										>
											{apiKey.expires === null
												? "Never"
												: parseDate(apiKey.expires)}
										</TableCell>
										<TableCell align="right">
											<IconButton
												type="button"
												sx={{ p: "10px" }}
												aria-label="delete"
												onClick={() => {
													setSelectApikey(apiKey.id);
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
