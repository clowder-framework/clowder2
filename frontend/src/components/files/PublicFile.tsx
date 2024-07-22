import React, { useEffect, useState } from "react";
import {
	FormControl,
	Grid,
	MenuItem,
	Snackbar,
	Tab,
	Tabs,
} from "@mui/material";
import { RootState } from "../../types/data";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import {
	fetchPublicFileSummary,
	fetchPublicFileVersions,
} from "../../actions/public_file.js";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { FileVersionHistory } from "../versions/FileVersionHistory";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import PublicLayout from "../PublicLayout";
import { fetchPublicDatasetAbout } from "../../actions/public_dataset";
import { FileDetails } from "./FileDetails";
import { fetchPublicFolderPath } from "../../actions/folder";
import { PublicFileActionsMenu } from "./PublicFileActionsMenu";
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import { TabStyle } from "../../styles/Styles";
import AssessmentIcon from "@mui/icons-material/Assessment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PublicVisualization } from "../visualizations/PublicVisualization";
import { ErrorModal } from "../errors/ErrorModal";
import { FileHistory } from "./FileHistory";
import { VersionChip } from "../versions/VersionChip";
import Typography from "@mui/material/Typography";
import { ClowderSelect } from "../styledComponents/ClowderSelect";
import { frozenCheck } from "../../utils/common";

export const PublicFile = (): JSX.Element => {
	// path parameter
	const { fileId } = useParams<{ fileId?: string }>();

	// search parameters
	const [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");
	const datasetId = searchParams.get("dataset");

	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchPublicDatasetAbout(datasetId));
	const dataset = useSelector(
		(state: RootState) => state.publicDataset.publicAbout
	);

	const dispatch = useDispatch();
	const listPublicFileSummary = (fileId: string | undefined) =>
		dispatch(fetchPublicFileSummary(fileId));
	const listPublicFileVersions = (
		fileId: string | undefined,
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchPublicFileVersions(fileId, skip, limit));
	const getPublicFolderPath = (folderId: string | null) =>
		dispatch(fetchPublicFolderPath(folderId));

	const file = useSelector((state: RootState) => state.publicFile);
	const fileSummary = useSelector(
		(state: RootState) => state.publicFile.publicFileSummary
	);
	const storageType = useSelector(
		(state: RootState) => state.publicFile.publicFileSummary.storage_type
	);
	const fileVersions = useSelector(
		(state: RootState) => state.publicFile.publicFileVersions
	);
	const latestVersionNum = useSelector(
		(state: RootState) => state.publicFile.publicFileSummary.version_num
	);
	const [selectedVersionNum, setSelectedVersionNum] = useState(
		latestVersionNum ?? 1
	);
	const folderPath = useSelector(
		(state: RootState) => state.folder.publicFolderPath
	);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	React.useState<boolean>(false);
	const [paths, setPaths] = useState([]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	// snack bar
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");

	const [versionEnabled, setVersionEnabled] = useState(false);

	// component did mount
	useEffect(() => {
		// load file information
		listPublicFileSummary(fileId);
		listPublicFileVersions(fileId, 0, 20);
		if (datasetId) {
			listDatasetAbout(datasetId); // get dataset name
		}
		if (folderId) {
			getPublicFolderPath(folderId); // get folder path
		}
	}, [fileId, datasetId, folderId]);

	// for breadcrumb
	useEffect(() => {
		const tmpPaths = [
			{
				name: dataset["name"],
				url: `/public_datasets/${datasetId}`,
			},
		];

		if (folderPath != null) {
			for (const folderBread of folderPath) {
				tmpPaths.push({
					name: folderBread["folder_name"],
					url: `/public_datasets/${datasetId}?folder=${
						folderBread && folderBread["folder_id"]
							? folderBread["folder_id"]
							: ""
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
						{versionEnabled ? (
							<VersionChip selectedVersion={selectedVersionNum} />
						) : (
							<></>
						)}
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
				<Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
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
							sx={
								frozenCheck(dataset.frozen, dataset.frozen_version_num) ||
								!versionEnabled
									? { display: "none" }
									: TabStyle
							}
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
				</Grid>
				<Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
					{latestVersionNum == selectedVersionNum ? (
						// latest version
						<>
							{Object.keys(fileSummary).length > 0 && (
								<FileDetails fileSummary={fileSummary} />
							)}
						</>
					) : (
						// history version
						<>
							{Object.keys(fileSummary).length > 0 && (
								<FileHistory
									name={file.publicFileSummary.name}
									contentType={
										file.publicFileSummary.content_type?.content_type
									}
									selectedVersionNum={selectedVersionNum}
								/>
							)}
						</>
					)}
					{versionEnabled ? (
						<>
							<Typography sx={{ wordBreak: "break-all" }}>Version</Typography>
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
		</PublicLayout>
	);
};
