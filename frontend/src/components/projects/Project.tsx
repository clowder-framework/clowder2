import React, {ChangeEvent, useEffect, useState} from "react";
import {Box, Grid, Snackbar, Tab, Tabs, Typography,} from "@mui/material";
import {useParams} from "react-router-dom";
import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchProject} from "../../actions/project";

import {a11yProps, TabPanel} from "../tabs/TabComponent";
import Layout from "../Layout";
// import { ActionsMenuGroup } from "../datasets/ActionsMenuGroup";
import {ProjectDetails} from "./ProjectDetails";
import {FormatListBulleted, InsertDriveFile} from "@material-ui/icons";
import {TabStyle} from "../../styles/Styles";
import {ErrorModal} from "../errors/ErrorModal";
import config from "../../app.config";

export const Project = (): JSX.Element => {
	// Path parameter
	const {projectId} = useParams<{ projectId?: string }>();

	// Redux connect equivalent
	const dispatch = useDispatch();

	const getProject = (projectId: string | undefined) => {
		console.log("getProject");
		console.log(projectId);
		dispatch(fetchProject(projectId));
	}
	const project = useSelector((state: RootState) => state.project.about);

	// State
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [errorOpen, setErrorOpen] = useState(false);
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");
	const [paths, setPaths] = useState([]);
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultFolderFilePerPage);

	useEffect(() => {
		getProject(projectId);
	}, [projectId]);

	// Breadcrumb
	useEffect(() => {
		if (project) {
			console.log("gotProject");
			console.log(project);
			const tmpPaths = [
				{
					name: project.name,
					url: `/projects/${projectId}`,
				},
			];
			setPaths(tmpPaths);
		}
	}, [project, projectId]);

	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		setCurrPageNum(value);
	};

	return (
		<Layout>
			{/* Error Message dialog */}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen}/>
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
				{/* Title */}
				<Grid item xs={8} sx={{display: "flex", alignItems: "center"}}>
					<Grid container spacing={2} alignItems="flex-start">
						<Grid item xs>
							<Box>
								<Typography variant="h5" paragraph sx={{marginBottom: 0}}>
									{project?.name ?? "Loading..."}
								</Typography>
								<Typography variant="body1" paragraph>
									{project?.description ?? ""}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</Grid>
				{/* Actions */}
				<Grid item xs={4} sx={{display: "flex-top", alignItems: "center"}}>
					{/*<ActionsMenuGroup />*/}
				</Grid>
			</Grid>
			<Grid container spacing={2} sx={{mt: 2}}>
				<Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
					<Tabs
						value={selectedTabIndex}
						onChange={handleTabChange}
						aria-label="dataset tabs"
						variant="scrollable"
						scrollButtons={false}
					>
						<Tab
							icon={<InsertDriveFile/>}
							iconPosition="start"
							sx={TabStyle}
							label="Datasets"
							{...a11yProps(0)}
						/>
						<Tab
							icon={<FormatListBulleted/>}
							iconPosition="start"
							sx={TabStyle}
							label="Members"
							{...a11yProps(1)}
							disabled={false}
						/>
					</Tabs>
					<TabPanel value={selectedTabIndex} index={0}/>
				</Grid>
				<Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
					{project ? <ProjectDetails details={project}/> : null}

				</Grid>
			</Grid>
		</Layout>
	);
};
