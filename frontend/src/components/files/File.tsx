import React, { useEffect, useState } from "react";
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
import { authCheck, frozenCheck } from "../../utils/common";
import { RootState } from "../../types/data";
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
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import { TabStyle } from "../../styles/Styles";
import BuildIcon from "@mui/icons-material/Build";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Visualization } from "../visualizations/Visualization";
import { ErrorModal } from "../errors/ErrorModal";
import { FileHistory } from "./FileHistory";
import { VersionChip } from "../versions/VersionChip";
import Typography from "@mui/material/Typography";
import { ClowderSelect } from "../styledComponents/ClowderSelect";
import { AuthWrapper } from "../auth/AuthWrapper";
import { FrozenWrapper } from "../auth/FrozenWrapper";

export const File = (): JSX.Element => {
	// path parameter
	const { fileId } = useParams<{ fileId?: string }>();

	// search parameters
	const [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");
	const datasetId = searchParams.get("dataset");

	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchDatasetAbout(datasetId));
	const dataset = useSelector((state: RootState) => state.dataset.about);

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
	const latestVersionNum = useSelector(
		(state: RootState) => state.file.fileSummary.version_num
	);
	const [selectedVersionNum, setSelectedVersionNum] = useState(
		latestVersionNum ?? 1
	);
	const [versionEnabled, setVersionEnabled] = useState(false);
	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);
	const fileVersions = useSelector(
		(state: RootState) => state.file.fileVersions
	);
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);
	const fileRole = useSelector((state: RootState) => state.file.fileRole);
	const storageType = useSelector(
		(state: RootState) => state.file.fileSummary.storage_type
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [enableAddMetadata, setEnableAddMetadata] =
		React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [paths, setPaths] = useState([]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	// snack bar
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");

	// component did mount
	useEffect(() => {
		// load file information
		listFileSummary(fileId);
		listFileVersions(fileId);

		if (datasetId) {
			listDatasetAbout(datasetId);
		}
		if (folderId) {
			getFolderPath(folderId); // get folder path
		}
	}, [adminMode, fileId, datasetId, folderId]);

	// for breadcrumb
	useEffect(() => {
		const tmpPaths = [
			{
				name: dataset["name"],
				url: `/datasets/${datasetId}`,
			},
		];

		if (folderPath != null) {
			for (const folderBread of folderPath) {
				tmpPaths.push({
					name: folderBread["folder_name"],
					url: `/datasets/${datasetId}?folder=${
						(folderBread && folderBread["folder_id"]) ?? ""
					}`,
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
	}, [dataset, fileSummary, folderPath]);

	useEffect(() => {
		if (latestVersionNum !== undefined && latestVersionNum !== null) {
			setSelectedVersionNum(latestVersionNum);
		}
	}, [latestVersionNum]);

	useEffect(() => {
		if (
			storageType === "minio" &&
			!frozenCheck(dataset.frozen, dataset.frozen_version_num)
		) {
			setVersionEnabled(true);
		} else {
			setVersionEnabled(false);
		}
	}, [storageType]);

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

	return (
		<Layout>
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
						{versionEnabled ? (
							<VersionChip selectedVersion={selectedVersionNum} />
						) : (
							<></>
						)}
					</Grid>
				</Grid>
				<Grid item xs={2} sx={{ display: "flex-top", alignItems: "center" }}>
					<FileActionsMenu
						fileId={fileId}
						datasetId={datasetId}
						setSelectedVersion={setSelectedVersionNum}
					/>
				</Grid>
			</Grid>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
					<Tabs
						value={selectedTabIndex}
						onChange={handleTabChange}
						aria-label="file tabs"
						variant="scrollable"
						scrollButtons={false}
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
							label="Analysis"
							{...a11yProps(3)}
							disabled={false}
							sx={
								frozenCheck(dataset.frozen, dataset.frozen_version_num)
									? { display: "none" }
									: !authCheck(adminMode, fileRole, [
											"owner",
											"editor",
											"uploader",
									  ])
									? { display: "none" }
									: TabStyle
							}
						/>
						<Tab
							icon={<HistoryIcon />}
							iconPosition="start"
							sx={
								frozenCheck(dataset.frozen, dataset.frozen_version_num)
									? { display: "none" }
									: TabStyle
							}
							label="Analysis History"
							{...a11yProps(4)}
							disabled={false}
						/>
						<Tab
							icon={<InsertDriveFile />}
							iconPosition="start"
							sx={
								frozenCheck(dataset.frozen, dataset.frozen_version_num) ||
								!versionEnabled
									? { display: "none" }
									: TabStyle
							}
							label="Version History"
							{...a11yProps(5)}
						/>
					</Tabs>
					<TabPanel value={selectedTabIndex} index={0}>
						<Visualization fileId={fileId} />
					</TabPanel>
					{/*Version History*/}
					<TabPanel value={selectedTabIndex} index={1}>
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
									publicView={false}
								/>
								<FrozenWrapper
									frozen={dataset.frozen}
									frozenVersionNum={dataset.frozen_version_num}
								>
									<AuthWrapper
										currRole={fileRole}
										allowedRoles={["owner", "editor", "uploader"]}
									>
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
									</AuthWrapper>
								</FrozenWrapper>
							</>
						)}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						<DisplayListenerMetadata
							updateMetadata={updateFileMetadata}
							deleteMetadata={deleteFileMetadata}
							resourceType="file"
							resourceId={fileId}
							version={fileSummary.version_num}
						/>
					</TabPanel>
					<TabPanel
						value={selectedTabIndex}
						index={3}
						sx={
							frozenCheck(dataset.frozen, dataset.frozen_version_num)
								? { display: "none" }
								: !authCheck(adminMode, fileRole, [
										"owner",
										"editor",
										"uploader",
								  ])
								? { display: "none" }
								: TabStyle
						}
					>
						<Listeners fileId={fileId} datasetId={datasetId} process="file" />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}>
						<ExtractionHistoryTab fileId={fileId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={5}>
						{fileVersions !== undefined ? (
							<FileVersionHistory fileVersions={fileVersions} />
						) : (
							<></>
						)}
					</TabPanel>
				</Grid>
				<Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
					{latestVersionNum == selectedVersionNum ? (
						// latest version
						<>
							{Object.keys(fileSummary).length > 0 && (
								<FileDetails fileSummary={fileSummary} myRole={fileRole} />
							)}
						</>
					) : (
						// history version
						<>
							{Object.keys(fileSummary).length > 0 && (
								<FileHistory
									name={file.fileSummary.name}
									contentType={file.fileSummary.content_type?.content_type}
									selectedVersionNum={selectedVersionNum}
								/>
							)}
						</>
					)}

					{versionEnabled ? (
						<>
							<Typography sx={{ wordBreak: "break-all" }}>
								File Version
							</Typography>
							<FormControl>
								<ClowderSelect
									value={String(selectedVersionNum)}
									defaultValue={"viewer"}
									onChange={(event) => {
										setSelectedVersionNum(event.target.value);
										setSnackBarMessage(`Viewing version ${event.target.value}`);
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
					) : (
						<></>
					)}
				</Grid>
			</Grid>
		</Layout>
	);
};
