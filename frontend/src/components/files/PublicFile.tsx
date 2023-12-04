import React, { useEffect, useState } from "react";
import config from "../../app.config";
import {
	Box,
	Button,
	FormControl,
	Grid,
	MenuItem,
	Snackbar,
	Tab,
	Tabs,
} from "@mui/material";
import {downloadPublicResource} from "../../utils/common";
import { PreviewConfiguration, RootState } from "../../types/data";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import {fetchPublicFileSummary, fetchPublicFileVersions, fetchPublicFileMetadata} from "../../actions/public_file.js";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { FileVersionHistory } from "../versions/FileVersionHistory";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import {
	fetchFileMetadata,
} from "../../actions/metadata";
import PublicLayout from "../PublicLayout";
import { fetchPublicDatasetAbout} from "../../actions/public_dataset";
import { FileDetails } from "./FileDetails";
import {fetchPublicFolderPath } from "../../actions/folder";
import { ExtractionHistoryTab } from "../listeners/ExtractionHistoryTab";
import { PublicFileActionsMenu } from "./PublicFileActionsMenu";
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import { TabStyle } from "../../styles/Styles";
import BuildIcon from "@mui/icons-material/Build";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PublicVisualization } from "../visualizations/PublicVisualization";
import { ErrorModal } from "../errors/ErrorModal";
import { FileHistory } from "./FileHistory";
import { VersionChip } from "../versions/VersionChip";
import Typography from "@mui/material/Typography";
import { ClowderSelect } from "../styledComponents/ClowderSelect";

export const PublicFile = (): JSX.Element => {
	// path parameter
	const { fileId } = useParams<{ fileId?: string }>();

	// search parameters
	const [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");
	const datasetId = searchParams.get("dataset");

	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchPublicDatasetAbout(datasetId));
	const about = useSelector((state: RootState) => state.publicDataset.public_about);

	const dispatch = useDispatch();
	const listPublicFileSummary = (fileId: string | undefined) =>
		dispatch(fetchPublicFileSummary(fileId));
	const listPublicFileVersions = (fileId: string | undefined,
		skip: number | undefined,
		limit: number | undefined) =>
		dispatch(fetchPublicFileVersions(fileId, skip, limit));
	const listFileMetadata = (fileId: string | undefined) =>
		dispatch(fetchPublicFileMetadata(fileId));
	const getPublicFolderPath = (folderId: string | null) =>
		dispatch(fetchPublicFolderPath(folderId));

	const file = useSelector((state: RootState) => state.publicFile);
	const fileSummary = useSelector((state: RootState) => state.publicFile.publicFileSummary);
	const filePreviews = useSelector((state: RootState) => state.publicFile.publicPreviews);
	const fileVersions = useSelector(
		(state: RootState) => state.publicFile.publicFileVersions
	);
	const latestVersionNum = useSelector(
		(state: RootState) => state.publicFile.publicFileSummary.version_num
	);
	const [selectedVersionNum, setSelectedVersionNum] = useState(
		latestVersionNum ?? 1
	);
	console.log("we got here");
	const folderPath = useSelector((state: RootState) => state.folder.publicFolderPath);
	console.log("after folder path");
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [previews, setPreviews] = useState([]);
	const [enableAddMetadata, setEnableAddMetadata] =
		React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [paths, setPaths] = useState([]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	const [showForbiddenPage, setShowForbiddenPage] = useState(false);
	const [showNotFoundPage, setShowNotFoundPage] = useState(false);

	// snack bar
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");

	// component did mount
	useEffect(() => {
		// load file information
		listPublicFileSummary(fileId);
		listPublicFileVersions(fileId, 0, 20);
		// FIXME replace checks for null with logic to load this info from redux instead of the page parameters
		if (datasetId != "null" && datasetId != "undefined") {
			listDatasetAbout(datasetId); // get dataset name
		}
		if (folderId != "null" && folderId != "undefined") {
			getPublicFolderPath(folderId); // get folder path
		}
	}, []);

	// for breadcrumb
	useEffect(() => {
		const tmpPaths = [
			{
				name: about["name"],
				url: `/public/datasets/${datasetId}`,
			},
		];

		if (folderPath != null) {
			for (const folderBread of folderPath) {
				tmpPaths.push({
					name: folderBread["folder_name"],
					url: `/public/datasets/${datasetId}?folder=${folderBread["folder_id"]}`,
				});
			}
		} else {
			tmpPaths.slice(0, 1);
		}

		// add file name to breadcrumb
		tmpPaths.push({
			name: fileSummary.name,
			url: "",
		});

		setPaths(tmpPaths);
	}, [about, fileSummary, folderPath]);

	console.log('about, filesummary and folderpath', about, fileSummary, folderPath)

	useEffect(() => {
		if (latestVersionNum !== undefined && latestVersionNum !== null) {
			setSelectedVersionNum(latestVersionNum);
		}
	}, [latestVersionNum]);

	useEffect(() => {
		(async () => {
			if (
				filePreviews !== undefined &&
				filePreviews.length > 0 &&
				filePreviews[0].previews !== undefined
			) {
				const previewsTemp: any = [];
				await Promise.all(
					filePreviews[0].previews.map(async (filePreview) => {
						// download resources
						const Configuration: PreviewConfiguration = {
							previewType: "",
							url: "",
							fileid: "",
							previewer: "",
							fileType: "",
							resource: "",
						};
						Configuration.previewType = filePreview["p_id"]
							.replace(" ", "-")
							.toLowerCase();
						Configuration.url = `/public/${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
						Configuration.fileid = filePreview["pv_id"];
						Configuration.previewer = `/public/${filePreview["p_path"]}/`;
						Configuration.fileType = filePreview["pv_contenttype"];

						const resourceURL = `/public/${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
						console.log("resourceURL", resourceURL);
						Configuration.resource = await downloadPublicResource(resourceURL);
						previewsTemp.push(Configuration);
					})
				);
				setPreviews(previewsTemp);
			}
		})();
	}, [filePreviews]);
	console.log("after await download resource", filePreviews);

	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	// if (showForbiddenPage) {
	// 	return <Forbidden />;
	// } else if (showNotFoundPage) {
	// 	return <PageNotFound />;
	// }

	return (
		<PublicLayout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			{/*snackbar*/}
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
				<Grid item xs={10} sx={{ display: "flex", alignItems: "center" }}>
					<MainBreadcrumbs paths={paths} />
					<Grid item>
						<VersionChip selectedVersion={selectedVersionNum} />
					</Grid>
				</Grid>
				<Grid item xs={2} sx={{ display: "flex-top", alignItems: "center" }}>
					<PublicFileActionsMenu
						fileId={fileId}
						datasetId={datasetId}
						setSelectedVersion={setSelectedVersionNum}
					/>
				</Grid>
			</Grid>
			<Grid container spacing={2}>
				<Grid item xs={10}>
					<Tabs
						value={selectedTabIndex}
						onChange={handleTabChange}
						aria-label="file tabs"
					>
						<Tab
							icon={<VisibilityIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Visualizations"
							{...a11yProps(0)}
							disabled={false}
						/>
						<Tab
							icon={<InsertDriveFile />}
							iconPosition="start"
							sx={TabStyle}
							label="Version History"
							{...a11yProps(1)}
						/>
						<Tab
							icon={<FormatListBulleted />}
							iconPosition="start"
							sx={TabStyle}
							label="User Metadata"
							{...a11yProps(2)}
							disabled={false}
						/>
						<Tab
							icon={<AssessmentIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Extracted Metadata"
							{...a11yProps(3)}
							disabled={false}
						/>
						{/*<Tab*/}
						{/*	icon={<BuildIcon />}*/}
						{/*	iconPosition="start"*/}
						{/*	sx={TabStyle}*/}
						{/*	label="Extract"*/}
						{/*	{...a11yProps(4)}*/}
						{/*	disabled={false}*/}
						{/*/>*/}
						<Tab
							icon={<HistoryIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Extraction History"
							{...a11yProps(5)}
							disabled={false}
						/>
					</Tabs>
					<TabPanel value={selectedTabIndex} index={0}>
						<PublicVisualization fileId={fileId} />
					</TabPanel>
					{/*Version History*/}
					<TabPanel value={selectedTabIndex} index={1}>
						{fileVersions !== undefined ? (
							<FileVersionHistory
								fileVersions={fileVersions}
								publicView={true}

							/>
						) : (
							<></>
						)}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						<DisplayMetadata
							updateMetadata={""}
							deleteMetadata={""}
							resourceType="file"
							resourceId={fileId}
							publicView={true}
						/>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={3}>
						<DisplayListenerMetadata
							updateMetadata={""}
							deleteMetadata={""}
							resourceType="file"
							resourceId={fileId}
							version={fileSummary.version_num}
							publicView={true}
						/>
					</TabPanel>
					{/*<TabPanel value={selectedTabIndex} index={4}>*/}
					{/*	<Listeners fileId={fileId} datasetId={datasetId} />*/}
					{/*</TabPanel>*/}
					<TabPanel value={selectedTabIndex} index={5}>
						<ExtractionHistoryTab fileId={fileId} />
					</TabPanel>
				</Grid>
				<Grid item xs={2}>
					{latestVersionNum == selectedVersionNum ? (
						// latest version
						<>
							{/*{Object.keys(fileSummary).length > 0 && (*/}
							{/*	<FileDetails fileSummary={fileSummary} />*/}
							{/*)}*/}
						</>
					) : (
						// history version
						<>
							{/*{Object.keys(fileSummary).length > 0 && (*/}
							{/*	<FileHistory*/}
							{/*		name={file.publicFileSummary.name}*/}
							{/*		contentType={file.publicFileSummary.content_type?.content_type}*/}
							{/*		selectedVersionNum={selectedVersionNum}*/}
							{/*	/>*/}
							{/*)}*/}
						</>
					)}
					<>
						<Typography sx={{ wordBreak: "break-all" }}>Version</Typography>
						<FormControl>
							<ClowderSelect
								value={String(selectedVersionNum)}
								defaultValue={"viewer"}
								onChange={(event) => {
									setSelectedVersionNum(event.target.value);
									setSnackBarMessage("Viewing version " + event.target.value);
									setSnackBarOpen(true);
								}}
							>
								{fileVersions.map((fileVersion) => {
									return (
										<MenuItem value={fileVersion.version_num}>
											{fileVersion.version_num}
										</MenuItem>
									);
								})}
							</ClowderSelect>
						</FormControl>
					</>
				</Grid>
			</Grid>
		</PublicLayout>
	)

	// return (
	// 	<Layout>
	// 		{/*Error Message dialogue*/}
	// 		<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
	// 		{/*snackbar*/}
	// 		<Snackbar
	// 			open={snackBarOpen}
	// 			autoHideDuration={6000}
	// 			onClose={() => {
	// 				setSnackBarOpen(false);
	// 				setSnackBarMessage("");
	// 			}}
	// 			message={snackBarMessage}
	// 		/>
	// 		<Grid container>
	// 			<Grid item xs={10} sx={{ display: "flex", alignItems: "center" }}>
	// 				<MainBreadcrumbs paths={paths} />
	// 				<Grid item>
	// 					<VersionChip selectedVersion={selectedVersionNum} />
	// 				</Grid>
	// 			</Grid>
	// 			<Grid item xs={2} sx={{ display: "flex-top", alignItems: "center" }}>
	// 				<PublicFileActionsMenu
	// 					fileId={fileId}
	// 					datasetId={datasetId}
	// 					setSelectedVersion={setSelectedVersionNum}
	// 				/>
	// 			</Grid>
	// 		</Grid>
	// 		<Grid container spacing={2}>
	// 			<Grid item xs={10}>
	// 				<Tabs
	// 					value={selectedTabIndex}
	// 					onChange={handleTabChange}
	// 					aria-label="file tabs"
	// 				>
	// 					<Tab
	// 						icon={<VisibilityIcon />}
	// 						iconPosition="start"
	// 						sx={TabStyle}
	// 						label="Visualizations"
	// 						{...a11yProps(0)}
	// 						disabled={false}
	// 					/>
	// 					<Tab
	// 						icon={<InsertDriveFile />}
	// 						iconPosition="start"
	// 						sx={TabStyle}
	// 						label="Version History"
	// 						{...a11yProps(1)}
	// 					/>
	// 					<Tab
	// 						icon={<FormatListBulleted />}
	// 						iconPosition="start"
	// 						sx={TabStyle}
	// 						label="User Metadata"
	// 						{...a11yProps(2)}
	// 						disabled={false}
	// 					/>
	// 					<Tab
	// 						icon={<AssessmentIcon />}
	// 						iconPosition="start"
	// 						sx={TabStyle}
	// 						label="Extracted Metadata"
	// 						{...a11yProps(3)}
	// 						disabled={false}
	// 					/>
	// 					{/*<Tab*/}
	// 					{/*	icon={<BuildIcon />}*/}
	// 					{/*	iconPosition="start"*/}
	// 					{/*	sx={TabStyle}*/}
	// 					{/*	label="Extract"*/}
	// 					{/*	{...a11yProps(4)}*/}
	// 					{/*	disabled={false}*/}
	// 					{/*/>*/}
	// 					<Tab
	// 						icon={<HistoryIcon />}
	// 						iconPosition="start"
	// 						sx={TabStyle}
	// 						label="Extraction History"
	// 						{...a11yProps(5)}
	// 						disabled={false}
	// 					/>
	// 				</Tabs>
	// 				<TabPanel value={selectedTabIndex} index={0}>
	// 					<PublicVisualization fileId={fileId} />
	// 				</TabPanel>
	// 				{/*Version History*/}
	// 				<TabPanel value={selectedTabIndex} index={1}>
	// 					{fileVersions !== undefined ? (
	// 						<FileVersionHistory fileVersions={fileVersions} />
	// 					) : (
	// 						<></>
	// 					)}
	// 				</TabPanel>
	// 				<TabPanel value={selectedTabIndex} index={2}>
	// 					<DisplayMetadata
	// 						updateMetadata={""}
	// 						deleteMetadata={""}
	// 						resourceType="file"
	// 						resourceId={fileId}
	// 					/>
	// 				</TabPanel>
	// 				<TabPanel value={selectedTabIndex} index={3}>
	// 					<DisplayListenerMetadata
	// 						updateMetadata={""}
	// 						deleteMetadata={""}
	// 						resourceType="file"
	// 						resourceId={fileId}
	// 						version={fileSummary.version_num}
	// 					/>
	// 				</TabPanel>
	// 				{/*<TabPanel value={selectedTabIndex} index={4}>*/}
	// 				{/*	<Listeners fileId={fileId} datasetId={datasetId} />*/}
	// 				{/*</TabPanel>*/}
	// 				<TabPanel value={selectedTabIndex} index={5}>
	// 					<ExtractionHistoryTab fileId={fileId} />
	// 				</TabPanel>
	// 			</Grid>
	// 			<Grid item xs={2}>
	// 				{latestVersionNum == selectedVersionNum ? (
	// 					// latest version
	// 					<>
	// 						{/*{Object.keys(fileSummary).length > 0 && (*/}
	// 						{/*	<FileDetails fileSummary={fileSummary} />*/}
	// 						{/*)}*/}
	// 					</>
	// 				) : (
	// 					// history version
	// 					<>
	// 						{/*{Object.keys(fileSummary).length > 0 && (*/}
	// 						{/*	<FileHistory*/}
	// 						{/*		name={file.publicFileSummary.name}*/}
	// 						{/*		contentType={file.publicFileSummary.content_type?.content_type}*/}
	// 						{/*		selectedVersionNum={selectedVersionNum}*/}
	// 						{/*	/>*/}
	// 						{/*)}*/}
	// 					</>
	// 				)}
	// 				<>
	// 					<Typography sx={{ wordBreak: "break-all" }}>Version</Typography>
	// 					<FormControl>
	// 						<ClowderSelect
	// 							value={String(selectedVersionNum)}
	// 							defaultValue={"viewer"}
	// 							onChange={(event) => {
	// 								setSelectedVersionNum(event.target.value);
	// 								setSnackBarMessage("Viewing version " + event.target.value);
	// 								setSnackBarOpen(true);
	// 							}}
	// 						>
	// 							{fileVersions.map((fileVersion) => {
	// 								return (
	// 									<MenuItem value={fileVersion.version_num}>
	// 										{fileVersion.version_num}
	// 									</MenuItem>
	// 								);
	// 							})}
	// 						</ClowderSelect>
	// 					</FormControl>
	// 				</>
	// 			</Grid>
	// 		</Grid>
	// 	</Layout>
	// );
};
