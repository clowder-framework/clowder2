import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Link as MuiLink,
	Pagination,
	Snackbar,
} from "@mui/material";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchMetadataDefinitions as fetchMetadataDefinitionsAction,
	searchMetadataDefinitions as searchMetadataDefinitionsAction,
} from "../../actions/metadata";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Layout from "../Layout";
import { ErrorModal } from "../errors/ErrorModal";
import { CreateMetadataDefinition } from "./CreateMetadataDefinition";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMetadataDefinitionModal from "./DeleteMetadataDefinitionModal";
import { Link } from "react-router-dom";
import { GenericSearchBox } from "../search/GenericSearchBox";
import { MetadataDefinitionOut } from "../../openapi/v2";
import config from "../../app.config";
import { fetchUserProfile } from "../../actions/user";

export function MetadataDefinitions() {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const currUserProfile = useSelector((state: RootState) => state.user.profile);
	const fetchCurrUserProfile = () => dispatch(fetchUserProfile());
	const listMetadataDefinitions = (
		name: string | undefined | null,
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchMetadataDefinitionsAction(name, skip, limit));
	const searchMetadataDefinitions = (
		searchTerm: string,
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(searchMetadataDefinitionsAction(searchTerm, skip, limit));
	const metadataDefinitions = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList.data
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList.metadata
	);
	const deletedMetadataDefinition = useSelector(
		(state: RootState) => state.metadata.deletedMetadataDefinition
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	// TODO add option to determine limit number; default show 5 metadata definitions each time
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultMetadataDefintionPerPage);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [createMetadataDefinitionOpen, setCreateMetadataDefinitionOpen] =
		useState<boolean>(false);
	const [
		deleteMetadataDefinitionConfirmOpen,
		setDeleteMetadataDefinitionConfirmOpen,
	] = useState<boolean>(false);
	const [selectedMetadataDefinition, setSelectedMetadataDefinition] =
		useState();

	// snack bar
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	// component did mount
	// user profile
	useEffect(() => {
		listMetadataDefinitions(null, 0, limit);
		fetchCurrUserProfile();
	}, []);

	// Admin mode will fetch all datasets
	useEffect(() => {
		listMetadataDefinitions(null, (currPageNum - 1) * limit, limit);
	}, [adminMode, deletedMetadataDefinition]);

	// search
	useEffect(() => {
		// reset page with each new search term
		setCurrPageNum(1);
		if (searchTerm !== "") searchMetadataDefinitions(searchTerm, 0, limit);
		else listMetadataDefinitions(null, 0, limit);
	}, [searchTerm]);

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		if (searchTerm !== "")
			searchMetadataDefinitions(searchTerm, newSkip, limit);
		else listMetadataDefinitions(null, newSkip, limit);
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			{/*TODO PUT SNACKBAR HERE FROM OTHER COMPONENT*/}
			<Snackbar
				open={snackBarOpen}
				autoHideDuration={6000}
				onClose={() => {
					setSnackBarOpen(false);
					setSnackBarMessage("");
				}}
				message={snackBarMessage}
			/>
			{/*Delete metadata definition modal*/}
			<DeleteMetadataDefinitionModal
				deleteMetadataDefinitionConfirmOpen={
					deleteMetadataDefinitionConfirmOpen
				}
				setDeleteMetadataDefinitionConfirmOpen={
					setDeleteMetadataDefinitionConfirmOpen
				}
				metdataDefinitionId={selectedMetadataDefinition}
			/>

			{/*create new metadata definition*/}
			<Dialog
				open={createMetadataDefinitionOpen}
				onClose={() => {
					setCreateMetadataDefinitionOpen(false);
				}}
				fullWidth={true}
				maxWidth="md"
				aria-labelledby="form-dialog"
			>
				<DialogTitle>Create New Metadata Definition</DialogTitle>
				<DialogContent>
					<CreateMetadataDefinition
						setCreateMetadataDefinitionOpen={setCreateMetadataDefinitionOpen}
					/>
				</DialogContent>
			</Dialog>
			<div className="outer-container">
				{currUserProfile.read_only_user ? (
					<></>
				) : (
					<Grid container>
						<Grid item xs={8} />
						<Grid item xs={4}>
							<Button
								variant="contained"
								onClick={() => {
									setCreateMetadataDefinitionOpen(true);
								}}
								sx={{ float: "right" }}
							>
								New Metadata Definition
							</Button>
						</Grid>
					</Grid>
				)}
				<br />
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<GenericSearchBox
							title="Search for Metadata Definitions"
							searchPrompt="keyword for metadata definition"
							setSearchTerm={setSearchTerm}
							searchTerm={searchTerm}
							searchFunction={searchMetadataDefinitions}
							skip={(currPageNum - 1) * limit}
							limit={limit}
						/>
					</Grid>
					<Grid item xs={12}>
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell
											sx={{
												fontWeight: 600,
											}}
										>
											Metadata Definition
										</TableCell>
										<TableCell
											sx={{
												fontWeight: 600,
											}}
											align="left"
										>
											Description
										</TableCell>
										<TableCell align="left" />
									</TableRow>
								</TableHead>
								<TableBody>
									{metadataDefinitions.map((mdd: MetadataDefinitionOut) => {
										return (
											<TableRow
												key={mdd.id}
												sx={{
													"&:last-child td, &:last-child th": { border: 0 },
												}}
											>
												<TableCell scope="row" key={`${mdd.id}-name`}>
													<MuiLink
														component={Link}
														to={`/metadata-definitions/${mdd.id}`}
														sx={{ textDecoration: "none" }}
													>
														{mdd.name}
													</MuiLink>
												</TableCell>
												<TableCell
													scope="row"
													key={`${mdd.id}-description`}
													align="left"
												>
													{mdd.description}
												</TableCell>
												<TableCell
													scope="row"
													key={`${mdd.id}-delete`}
													align="left"
												>
													{currUserProfile.read_only_user ? (
														<></>
													) : (
														<IconButton
															aria-label="delete"
															size="small"
															onClick={() => {
																setSelectedMetadataDefinition(mdd.id);
																setDeleteMetadataDefinitionConfirmOpen(true);
															}}
														>
															<DeleteIcon fontSize="small" />
														</IconButton>
													)}
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
				</Grid>
			</div>
		</Layout>
	);
}
