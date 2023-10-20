import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	ButtonGroup,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	InputBase,
} from "@mui/material";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchMetadataDefinitions as fetchMetadataDefinitionsAction,
	searchMetadataDefinitions as searchMetadataDefinitionsAction,
} from "../../actions/metadata";
import { ArrowBack, ArrowForward, SearchOutlined } from "@material-ui/icons";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import InfoIcon from "@mui/icons-material/Info";
import { theme } from "../../theme";
import Layout from "../Layout";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { ErrorModal } from "../errors/ErrorModal";
import { CreateMetadataDefinition } from "./CreateMetadataDefinition";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteMetadataDefinitionModal from "./DeleteMetadataDefinitionModal";

export function MetadataDefinitions() {
	// Redux connect equivalent
	const dispatch = useDispatch();
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
		(state: RootState) => state.metadata.metadataDefinitionList
	);

	// TODO add option to determine limit number; default show 5 metadata definitions each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit] = useState<number>(5);
	const [skip, setSkip] = useState<number | undefined>(0);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [createMetadataDefinitionOpen, setCreateMetadataDefinitionOpen] =
		useState<boolean>(false);
	const [
		deleteMetadataDefinitionConfirmOpen,
		setDeleteMetadataDefinitionConfirmOpen,
	] = useState<boolean>(false);
	const [selectedMetadataDefinition, setSelectedMetadataDefinition] =
		useState();

	// for breadcrumb
	const paths = [
		{
			name: "Metadata Definitions",
			url: "/metadata-definitions",
		},
	];

	// component did mount
	useEffect(() => {
		listMetadataDefinitions(null, skip, limit);
	}, []);

	useEffect(() => {
		// disable flipping if reaches the last page
		if (metadataDefinitions.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [metadataDefinitions]);

	// search
	useEffect(() => {
		if (searchTerm !== "") searchMetadataDefinitions(searchTerm, skip, limit);
		else listMetadataDefinitions(null, skip, limit);
	}, [searchTerm]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listMetadataDefinitions(null, skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (metadataDefinitions.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />

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
			{/*breadcrumb*/}
			<Grid container>
				<Grid item xs={8} sx={{ display: "flex", alignItems: "center" }}>
					<MainBreadcrumbs paths={paths} />
				</Grid>
				<Grid item xs={4}>
					<Button
						variant="contained"
						onClick={() => {
							setCreateMetadataDefinitionOpen(true);
						}}
						endIcon={<InfoIcon />}
						sx={{ float: "right" }}
					>
						New Metadata Definition
					</Button>
				</Grid>
			</Grid>
			<br />
			<Grid container>
				<Grid item xs={3}>
					<Box
						component="form"
						sx={{
							p: "2px 4px",
							display: "flex",
							alignItems: "left",
							backgroundColor: theme.palette.primary.contrastText,
							width: "80%",
						}}
					>
						<InputBase
							sx={{ ml: 1, flex: 1 }}
							placeholder="keyword for metadat definition"
							inputProps={{
								"aria-label":
									"Type in keyword to search for metadat definition",
							}}
							onChange={(e) => {
								setSearchTerm(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									searchMetadataDefinitions(searchTerm, skip, limit);
								}
							}}
							value={searchTerm}
						/>
						<IconButton
							type="button"
							sx={{ p: "10px" }}
							aria-label="search"
							onClick={() => {
								searchMetadataDefinitions(searchTerm, skip, limit);
							}}
						>
							<SearchOutlined />
						</IconButton>
					</Box>
				</Grid>
				<Grid item xs={9}>
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
									<TableCell align="left"></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{metadataDefinitions.map((mdd) => {
									return (
										<TableRow
											key={mdd.id}
											sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
										>
											<TableCell scope="row" key={`${mdd.id}-name`}>
												{/*TODO write individual metadata definition page*/}
												{/*<Button*/}
												{/*	component={Link}*/}
												{/*	to={`/metadata-definitions/${mdd.id}`}*/}
												{/*>*/}
												{/*	{mdd.name}*/}
												{/*</Button>*/}
												{mdd.name}
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
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
						<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
							<ButtonGroup
								variant="contained"
								aria-label="previous next buttons"
							>
								<Button
									aria-label="previous"
									onClick={previous}
									disabled={prevDisabled}
								>
									<ArrowBack /> Prev
								</Button>
								<Button
									aria-label="next"
									onClick={next}
									disabled={nextDisabled}
								>
									Next <ArrowForward />
								</Button>
							</ButtonGroup>
						</Box>
					</TableContainer>
				</Grid>
			</Grid>
		</Layout>
	);
}
