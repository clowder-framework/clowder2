import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	Grid,
	Pagination,
	Snackbar,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject } from "../../actions/project";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
// import FilesTable from "../files/FilesTable";
import Layout from "../Layout";
// import { ActionsMenuGroup } from "../datasets/ActionsMenuGroup";
import { ProjectDetails } from "./ProjectDetails";
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import ShareIcon from "@mui/icons-material/Share";
import BuildIcon from "@mui/icons-material/Build";
import { TabStyle } from "../../styles/Styles";
import { ErrorModal } from "../errors/ErrorModal";
import VisibilityIcon from "@mui/icons-material/Visibility";
import config from "../../app.config";

export const Project = (): JSX.Element => {
	// path parameter
	const { projectId } = useParams<{ projectId?: string }>();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const getProject = (projectId: string | null) =>
		dispatch(fetchProject(projectId));
	const project = useSelector((state: RootState) => state.project.project);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	// Snackbar
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");

	const [paths, setPaths] = useState([]);

	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultFolderFilePerPage);

	useEffect(() => {
		getProject(projectId);
	}, [projectId]);

	// for breadcrumb
	useEffect(() => {
		// for breadcrumb
		const tmpPaths = [
			{
				name: project["name"],
				url: `/projects/${projectId}`,
			},
		];

		setPaths(tmpPaths);
	}, [project]);

	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
	};

	// @ts-ignore
	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			<Snackbar
				open={snackBarOpen}
				autoHideDuration={6000}
				onClose={() => {
					setSnackBarOpen(false);
					setSnackBarMessage("");
				}}
				message={snackBarMessage}
			/>
			<Grid container>
				{/*title*/}
				<Grid item xs={8} sx={{ display: "flex", alignItems: "center" }}>
					<Grid container spacing={2} alignItems="flex-start">
						<Grid item xs>
							<Box>
								<Typography variant="h5" paragraph sx={{ marginBottom: 0 }}>
									{project["name"]}
								</Typography>
								<Typography variant="body1" paragraph>
									{project["description"]}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</Grid>
				{/*actions*/}
				<Grid item xs={4} sx={{ display: "flex-top", alignItems: "center" }}>
					{/*<ActionsMenuGroup />*/}
				</Grid>
				{/*actions*/}
			</Grid>
			<Grid container spacing={2} sx={{ mt: 2 }}>
				<Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
					<Tabs
						value={selectedTabIndex}
						onChange={handleTabChange}
						aria-label="dataset tabs"
						variant="scrollable"
						scrollButtons={false}
					>
						<Tab
							icon={<InsertDriveFile />}
							iconPosition="start"
							sx={TabStyle}
							label="Resources"
							{...a11yProps(0)}
						/>
						<Tab
							icon={<FormatListBulleted />}
							iconPosition="start"
							sx={TabStyle}
							label="User Metadata"
							{...a11yProps(1)}
							disabled={false}
						/>
						<Tab
							icon={<AssessmentIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Machine Metadata"
							{...a11yProps(2)}
							disabled={false}
						/>
						<Tab
							icon={<BuildIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Analysis"
							{...a11yProps(3)}
							disabled={false}
						/>
						<Tab
							icon={<HistoryIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Extraction History"
							{...a11yProps(4)}
							disabled={false}
						/>
						<Tab
							icon={<VisibilityIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Visualizations"
							{...a11yProps(5)}
							disabled={false}
						/>
						<Tab
							icon={<ShareIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Access Control"
							{...a11yProps(6)}
							disabled={false}
						/>
					</Tabs>
					<TabPanel value={selectedTabIndex} index={0}>
						{/*<FilesTable*/}
						{/*	folderId={project.folder_ids}*/}
						{/*	foldersFilesInDataset={project}*/}
						{/*	setCurrPageNum={setCurrPageNum}*/}
						{/*	publicView={false}*/}
						{/*/>*/}
						<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
							<Pagination
								count={Math.ceil(20 / limit)}
								page={currPageNum}
								onChange={handlePageChange}
								shape="rounded"
								variant="outlined"
							/>
						</Box>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						{/*<DisplayMetadata*/}
						{/*			updateMetadata={updateDatasetMetadata}*/}
						{/*			deleteMetadata={deleteDatasetMetadata}*/}
						{/*			resourceType="dataset"*/}
						{/*			resourceId={datasetId}*/}
						{/*			publicView={false}*/}
						{/*		/>*/}
						{/*)}*/}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						{/*<DisplayListenerMetadata*/}
						{/*	updateMetadata={updateDatasetMetadata}*/}
						{/*	deleteMetadata={deleteDatasetMetadata}*/}
						{/*	resourceType="dataset"*/}
						{/*	resourceId={datasetId}*/}
						{/*/>*/}
					</TabPanel>
					{/* Viewer is not allowed to submit to extractor*/}
					<TabPanel value={selectedTabIndex} index={3} sx={TabStyle}>
						{/*<Listeners datasetId={datasetId} />*/}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}>
						{/*<ExtractionHistoryTab datasetId={datasetId} />*/}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={5}>
						{/*<Visualization datasetId={datasetId} />*/}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={6}>
						{/*<SharingTab datasetId={datasetId} />*/}
					</TabPanel>
				</Grid>
				<Grid item>
					<ProjectDetails details={project} />
				</Grid>
			</Grid>
		</Layout>
	);
};
