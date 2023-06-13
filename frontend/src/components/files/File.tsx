import React, { lazy, Suspense, useEffect, useState } from "react";
import config from "../../app.config";
import { Box, Button, Grid, Tab, Tabs, Typography } from "@mui/material";
import { downloadResource, parseDate } from "../../utils/common";
import { PreviewConfiguration, RootState } from "../../types/data";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetFailedReason } from "../../actions/common";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import { fetchFileSummary, fetchFileVersions } from "../../actions/file";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { ActionModal } from "../dialog/ActionModal";
import { FileVersionHistory } from "../versions/FileVersionHistory";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import {
	deleteFileMetadata as deleteFileMetadataAction,
	fetchFileMetadata,
	patchFileMetadata as patchFileMetadataAction,
	postFileMetadata as createFileMetadataAction,
} from "../../actions/metadata";
import { EditMetadata } from "../metadata/EditMetadata";
import Layout from "../Layout";
import { fetchDatasetAbout } from "../../actions/dataset";
import { FileDetails } from "./FileDetails";
import { fetchFolderPath } from "../../actions/folder";
import { Listeners } from "../listeners/Listeners";
import { ExtractionHistoryTab } from "../listeners/ExtractionHistoryTab";
import { FileActionsMenu } from "./FileActionsMenu";
import RoleChip from "../auth/RoleChip";
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import { TabStyle } from "../../styles/Styles";
import BuildIcon from "@mui/icons-material/Build";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import { Forbidden } from "../errors/Forbidden";
import { PageNotFound } from "../errors/PageNotFound";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Image = lazy(
	() => import(/* webpackChunkName: "previewers-image" */ "../previewers/Image")
);
const Audio = lazy(
	() => import(/* webpackChunkName: "previewers-audio" */ "../previewers/Audio")
);
const Video = lazy(
	() => import(/* webpackChunkName: "previewers-video" */ "../previewers/Video")
);

const Iframe = lazy(
	() =>
		import(/* webpackChunkName: "previewers-iframe" */ "../previewers/Iframe")
);

const Text = lazy(
	() => import(/* webpackChunkName: "previewers-text" */ "../previewers/Text")
);

export const File = (): JSX.Element => {
	// path parameter
	const { fileId } = useParams<{ fileId?: string }>();

	// search parameters
	const [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");
	const datasetId = searchParams.get("dataset");

	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchDatasetAbout(datasetId));
	const about = useSelector((state: RootState) => state.dataset.about);

	const dispatch = useDispatch();
	const listFileSummary = (fileId: string | undefined) =>
		dispatch(fetchFileSummary(fileId));
	const listFileVersions = (fileId: string | undefined) =>
		dispatch(fetchFileVersions(fileId));
	const listFileMetadata = (fileId: string | undefined) =>
		dispatch(fetchFileMetadata(fileId));
	const dismissError = () => dispatch(resetFailedReason());
	const createFileMetadata = (fileId: string | undefined, metadata: object) =>
		dispatch(createFileMetadataAction(fileId, metadata));
	const updateFileMetadata = (fileId: string | undefined, metadata: object) =>
		dispatch(patchFileMetadataAction(fileId, metadata));
	const deleteFileMetadata = (fileId: string | undefined, metadata: object) =>
		dispatch(deleteFileMetadataAction(fileId, metadata));
	const getFolderPath = (folderId: string | null) =>
		dispatch(fetchFolderPath(folderId));

	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);
	const filePreviews = useSelector((state: RootState) => state.file.previews);
	const fileVersions = useSelector(
		(state: RootState) => state.file.fileVersions
	);
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const fileRole = useSelector((state: RootState) => state.file.fileRole);

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [previews, setPreviews] = useState([]);
	const [enableAddMetadata, setEnableAddMetadata] =
		React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [allowSubmit, setAllowSubmit] = React.useState<boolean>(false);

	// component did mount
	useEffect(() => {
		// load file information
		listFileSummary(fileId);
		listFileVersions(fileId);
		// FIXME replace checks for null with logic to load this info from redux instead of the page parameters
		if (datasetId != "null" && datasetId != "undefined") {
			listDatasetAbout(datasetId); // get dataset name
		}
		if (folderId != "null" && folderId != "undefined") {
			getFolderPath(folderId); // get folder path
		}
	}, []);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	const [showForbiddenPage, setShowForbiddenPage] = useState(false);
	const [showNotFoundPage, setShowNotFoundPage] = useState(false);

	useEffect(() => {
		if (reason == "Forbidden") {
			setShowForbiddenPage(true);
		} else if (reason == "Not Found") {
			setShowNotFoundPage(true);
		} else if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);
		}
	}, [reason]);
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	};
	const handleErrorReport = () => {
		window.open(
			`${config.GHIssueBaseURL}+${encodeURIComponent(
				reason
			)}&body=${encodeURIComponent(stack)}`
		);
	};

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
						Configuration.url = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
						Configuration.fileid = filePreview["pv_id"];
						Configuration.previewer = `/public${filePreview["p_path"]}/`;
						Configuration.fileType = filePreview["pv_contenttype"];

						const resourceURL = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
						Configuration.resource = await downloadResource(resourceURL);

						previewsTemp.push(Configuration);
					})
				);
				setPreviews(previewsTemp);
			}
		})();
	}, [filePreviews]);

	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	const setMetadata = (metadata: any) => {
		// TODO wrap this in to a function
		console.log("metadata in file component");
		console.log(metadata);
		setMetadataRequestForms((prevState) => {
			// merge the content field; e.g. lat lon
			if (metadata.definition in prevState) {
				const prevContent = prevState[metadata.definition].content;
				metadata.content = { ...prevContent, ...metadata.content };
			}
			return { ...prevState, [metadata.definition]: metadata };
		});
	};

	const handleMetadataUpdateFinish = () => {
		Object.keys(metadataRequestForms).map((key) => {
			if (
				"id" in metadataRequestForms[key] &&
				metadataRequestForms[key]["id"] !== undefined &&
				metadataRequestForms[key]["id"] !== null &&
				metadataRequestForms[key]["id"] !== ""
			) {
				// update existing metadata
				updateFileMetadata(fileId, metadataRequestForms[key]);
			} else {
				// post new metadata if metadata id doesn't exist
				createFileMetadata(fileId, metadataRequestForms[key]);
			}
		});

		// reset the form
		setMetadataRequestForms({});

		// pulling lastest from the API endpoint
		listFileMetadata(fileId);

		// switch to display mode
		setEnableAddMetadata(false);
	};

	// const submitToListener = ()=> {
	// 	const filename = fileSummary['name']
	// 	console.log('submit to listener');
	// 	console.log("the file name is", filename);
	// 	console.log('the file id is', fileId);
	// 	history(`/listeners?fileId=${fileId}&fileName=${filename}`);
	// }

	// for breadcrumb
	const paths = [
		{
			name: about["name"],
			url: `/datasets/${datasetId}`,
		},
	];

	// add folder path to breadcrumbs
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);
	if (folderPath != null) {
		for (const folderBread of folderPath) {
			paths.push({
				name: folderBread["folder_name"],
				url: `/datasets/${datasetId}?folder=${folderBread["folder_id"]}`,
			});
		}
	} else {
		paths.slice(0, 1);
	}

	if (showForbiddenPage) {
		return <Forbidden />;
	} else if (showNotFoundPage) {
		return <PageNotFound />;
	}

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ActionModal
				actionOpen={errorOpen}
				actionTitle="Something went wrong..."
				actionText={reason}
				actionBtnName="Report"
				handleActionBtnClick={handleErrorReport}
				handleActionCancel={handleErrorCancel}
			/>

			<Grid container>
				<Grid item xs={8} sx={{ display: "flex", alignItems: "center" }}>
					<MainBreadcrumbs paths={paths} />
				</Grid>
				<Grid item xs={4}>
					<FileActionsMenu
						filename={fileSummary.name}
						fileId={fileId}
						datasetId={datasetId}
					/>
				</Grid>
			</Grid>
			<Grid container>
				<Grid item xs={10}>
					<Box
						sx={{
							display: "inline-flex",
							justifyContent: "space-between",
							alignItems: "baseline",
						}}
					>
						<Typography variant="h4" paragraph>
							{fileSummary.name}
						</Typography>
					</Box>
					<Box>
						<RoleChip role={fileRole} />
					</Box>
					<Box sx={{ mt: 2 }}>
						{Object.keys(fileSummary).length > 0 && (
							<Typography variant="subtitle2" paragraph>
								Uploaded {parseDate(fileSummary.created)} by{" "}
								{fileSummary.creator.first_name} {fileSummary.creator.last_name}
							</Typography>
						)}
					</Box>
					<Tabs
						value={selectedTabIndex}
						onChange={handleTabChange}
						aria-label="file tabs"
					>
						<Tab
							icon={<VisibilityIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Preview"
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
						<Tab
							icon={<BuildIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Extract"
							{...a11yProps(4)}
							disabled={false}
						/>
						<Tab
							icon={<HistoryIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Extraction History"
							{...a11yProps(5)}
							disabled={false}
						/>
					</Tabs>
					{/*Version History*/}
					<TabPanel value={selectedTabIndex} index={0}>
						<LazyLoadErrorBoundary fallback={<div>Fail to load...</div>}>
							<Suspense fallback={<div>Loading...</div>}>
								{/*<Image fileId={fileId} />*/}
								{/*<Audio fileId={fileId} />*/}
								{/*<Video fileId={fileId} />*/}
								{/*<Iframe fileId={fileId} />*/}
								<Text fileId={fileId} />
							</Suspense>
						</LazyLoadErrorBoundary>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						{fileVersions !== undefined ? (
							<FileVersionHistory
								fileVersions={fileVersions}
								filename={fileSummary.name}
							/>
						) : (
							<></>
						)}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						{enableAddMetadata ? (
							<>
								<EditMetadata
									resourceType="file"
									resourceId={fileId}
									setMetadata={setMetadata}
								/>
								<Button
									variant="contained"
									onClick={handleMetadataUpdateFinish}
									sx={{ mt: 1, mr: 1 }}
								>
									Update
								</Button>
								<Button
									onClick={() => {
										setEnableAddMetadata(false);
									}}
									sx={{ mt: 1, mr: 1 }}
								>
									Cancel
								</Button>
							</>
						) : (
							<>
								<DisplayMetadata
									updateMetadata={updateFileMetadata}
									deleteMetadata={deleteFileMetadata}
									resourceType="file"
									resourceId={fileId}
								/>
								<Box textAlign="center">
									<Button
										variant="contained"
										sx={{ m: 2 }}
										onClick={() => {
											setEnableAddMetadata(true);
										}}
									>
										Add Metadata
									</Button>
								</Box>
							</>
						)}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={3}>
						<DisplayListenerMetadata
							updateMetadata={updateFileMetadata}
							deleteMetadata={deleteFileMetadata}
							resourceType="file"
							resourceId={fileId}
							version={fileSummary.version_num}
						/>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}>
						<Listeners fileId={fileId} datasetId={datasetId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}>
						<ExtractionHistoryTab fileId={fileId} />
					</TabPanel>
				</Grid>
				<Grid item xs={2}>
					{Object.keys(fileSummary).length > 0 && (
						<FileDetails fileSummary={fileSummary} />
					)}
				</Grid>
			</Grid>
		</Layout>
	);
};
