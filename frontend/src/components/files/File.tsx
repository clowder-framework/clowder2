import React, { useEffect, useState } from "react";
import config from "../../app.config";
import { Box, Button, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { downloadResource, parseDate } from "../../utils/common";
import { PreviewConfiguration, RootState } from "../../types/data";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import { fetchFileSummary, fetchFileVersions } from "../../actions/file";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Visualization } from "../visualizations/Visualization";
import { ErrorModal } from "../errors/ErrorModal";
import { VersionChip } from "../versions/VersionChip";
import { FileHistory } from "./FileHistory";

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
	const createFileMetadata = (fileId: string | undefined, metadata: object) =>
		dispatch(createFileMetadataAction(fileId, metadata));
	const updateFileMetadata = (fileId: string | undefined, metadata: object) =>
		dispatch(patchFileMetadataAction(fileId, metadata));
	const deleteFileMetadata = (fileId: string | undefined, metadata: object) =>
		dispatch(deleteFileMetadataAction(fileId, metadata));
	const getFolderPath = (folderId: string | null) =>
		dispatch(fetchFolderPath(folderId));

	const file = useSelector((state: RootState) => state.file);
	const version_num = useSelector(
		(state: RootState) => state.file.fileSummary.version_num
	);
	const [selectedVersion, setSelectedVersion] = useState(version_num);
	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);
	const filePreviews = useSelector((state: RootState) => state.file.previews);
	const fileVersions = useSelector(
		(state: RootState) => state.file.fileVersions
	);
	const [selectedFileVersionDetails, setSelectedFileVersionDetails] = useState(
		fileVersions[0]
	);
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

	useEffect(() => {
		if (version_num !== undefined && version_num !== null) {
			setSelectedVersion(version_num);
		}
	}, [version_num]);

	useEffect(() => {
		if (
			version_num !== undefined &&
			version_num !== null &&
			fileVersions !== undefined &&
			fileVersions !== null &&
			fileVersions.length > 0
		) {
			fileVersions.map((fileVersion, idx) => {
				if (fileVersion.version_num == version_num) {
					setSelectedFileVersionDetails(fileVersion);
				}
			});
		}
	}, [version_num]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	const [showForbiddenPage, setShowForbiddenPage] = useState(false);
	const [showNotFoundPage, setShowNotFoundPage] = useState(false);

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

	// add file name to breadcrumb

	if (showForbiddenPage) {
		return <Forbidden />;
	} else if (showNotFoundPage) {
		return <PageNotFound />;
	}

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			<Grid container>
				<Grid item xs={10} sx={{ display: "flex", alignItems: "center" }}>
					<Stack>
						<Box
							sx={{
								display: "inline-flex",
								justifyContent: "space-between",
								alignItems: "center",
							}}
						>
							<Typography variant="h4">{fileSummary.name}</Typography>
							<VersionChip
								selectedVersion={selectedVersion}
								setSelectedVersion={setSelectedVersion}
								versionNumbers={fileVersions}
								isClickable={true}
							/>
						</Box>
						<Box>
							<RoleChip role={fileRole} />
						</Box>
					</Stack>
				</Grid>
				<Grid item xs={2} sx={{ display: "flex-top", alignItems: "center" }}>
					<FileActionsMenu
						filename={fileSummary.name}
						fileId={fileId}
						datasetId={datasetId}
					/>
				</Grid>
			</Grid>
			<Grid container spacing={2} sx={{ mt: 2 }}>
				<Grid item xs={10}>
					{Object.keys(fileSummary).length > 0 && (
						<Typography variant="subtitle2" paragraph>
							Uploaded {parseDate(fileSummary.created)} by{" "}
							{fileSummary.creator.first_name} {fileSummary.creator.last_name}
						</Typography>
					)}
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
					<Box style={{ padding: "24px 24px 0 24px" }}>
						<MainBreadcrumbs paths={paths} />
					</Box>
					<TabPanel value={selectedTabIndex} index={0}>
						<Visualization fileId={fileId} />
					</TabPanel>
					{/*Version History*/}
					<TabPanel value={selectedTabIndex} index={1}>
						{fileVersions !== undefined ? (
							<FileVersionHistory fileVersions={fileVersions} />
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
					<TabPanel value={selectedTabIndex} index={5}>
						<ExtractionHistoryTab fileId={fileId} />
					</TabPanel>
				</Grid>
				{version_num == selectedVersion ? (
					<Grid item xs={2}>
						{Object.keys(fileSummary).length > 0 && (
							<FileDetails fileSummary={fileSummary} />
						)}
					</Grid>
				) : (
					<Grid item xs={2}>
						{Object.keys(fileSummary).length > 0 && (
							<FileHistory
								id={fileId}
								created={file.fileSummary.created}
								name={file.fileSummary.name}
								creator={file.fileSummary.creator}
								version_id={file.fileSummary.version_id}
								bytes={file.fileSummary.bytes}
								content_type={file.fileSummary.content_type}
								views={file.fileSummary.views}
								downloads={file.fileSummary.downloads}
								current_version={selectedVersion}
								fileSummary={file.fileSummary}
							/>
						)}
					</Grid>
				)}
			</Grid>
		</Layout>
	);
};
