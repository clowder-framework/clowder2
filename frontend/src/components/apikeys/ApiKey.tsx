import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, Pagination } from "@mui/material";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
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
import config from "../../app.config";

export function ApiKeys() {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listApiKeys = (skip: number | undefined, limit: number | undefined) =>
		dispatch(listApiKeysAction(skip, limit));
	const deleteApiKey = (keyId: string) => dispatch(deleteApiKeyAction(keyId));

	const apiKeys = useSelector((state: RootState) => state.user.apiKeys.data);
	const pageMetadata = useSelector(
		(state: RootState) => state.user.apiKeys.metadata
	);
	const deletedApiKey = useSelector(
		(state: RootState) => state.user.deletedApiKey
	);
	const hashedKey = useSelector((state: RootState) => state.user.hashedKey);

	// TODO add option to determine limit number; default show 5 tokens each time
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultApikeyPerPage);
	const [selectedApikey, setSelectApikey] = useState("");
	const [deleteApikeyConfirmOpen, setDeleteApikeyConfirmOpen] = useState(false);
	const [createApiKeyModalOpen, setCreateApiKeyModalOpen] = useState(false);

	// component did mount
	useEffect(() => {
		listApiKeys((currPageNum - 1) * limit, limit);
	}, [deletedApiKey, hashedKey]);

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listApiKeys(newSkip, limit);
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
					actionLevel={"error"}
				/>
				{/*create api key modal*/}
				<CreateApiKeyModal
					skip={(currPageNum - 1) * limit}
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
						<Pagination
							count={Math.ceil(pageMetadata.total_count / limit)}
							page={currPageNum}
							onChange={handlePageChange}
							shape="rounded"
							variant="outlined"
						/>
					</Box>
				</TableContainer>
			</Grid>
		</Layout>
	);
}
