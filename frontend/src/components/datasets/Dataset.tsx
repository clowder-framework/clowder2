// lazy loading
import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	Button,
	Grid,
	Pagination,
	Stack,
	Tab,
	Tabs,
	Typography,
	Link,
	IconButton,
	DialogTitle,
	DialogContent,
	Dialog,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchDatasetAbout,
	fetchDatasetLicense,
	fetchFoldersFilesInDataset as fetchFoldersFilesInDatasetAction,
} from "../../actions/dataset";
import { fetchFolderPath } from "../../actions/folder";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import FilesTable from "../files/FilesTable";
import { LicenseOption, MetadataIn } from "../../openapi/v2";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import { EditMetadata } from "../metadata/EditMetadata";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import {
	deleteDatasetMetadata as deleteDatasetMetadataAction,
	fetchDatasetMetadata,
	fetchMetadataDefinitions,
	patchDatasetMetadata as patchDatasetMetadataAction,
	postDatasetMetadata,
} from "../../actions/metadata";
import Layout from "../Layout";
import { ActionsMenu } from "./ActionsMenu";
import { DatasetDetails } from "./DatasetDetails";
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import { Listeners } from "../listeners/Listeners";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import ShareIcon from "@mui/icons-material/Share";
import BuildIcon from "@mui/icons-material/Build";
import { ExtractionHistoryTab } from "../listeners/ExtractionHistoryTab";
import { SharingTab } from "../sharing/SharingTab";
import RoleChip from "../auth/RoleChip";
import { TabStyle } from "../../styles/Styles";
import { ErrorModal } from "../errors/ErrorModal";
import { Visualization } from "../visualizations/Visualization";
import VisibilityIcon from "@mui/icons-material/Visibility";
import config from "../../app.config";
import { EditLicenseModal } from "./EditLicenseModal";
import { V2 } from "../../openapi";
import {
	fetchStandardLicenses,
	fetchStandardLicenseUrl,
} from "../../utils/licenses";
import { authCheck } from "../../utils/common";

export const Dataset = (): JSX.Element => {
	// path parameter
	const { datasetId } = useParams<{ datasetId?: string }>();

	// search parameters
	const [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");
	// Redux connect equivalent
	const dispatch = useDispatch();
	const updateDatasetMetadata = (
		datasetId: string | undefined,
		content: object
	) => dispatch(patchDatasetMetadataAction(datasetId, content));
	const createDatasetMetadata = (
		datasetId: string | undefined,
		metadata: MetadataIn
	) => dispatch(postDatasetMetadata(datasetId, metadata));
	const deleteDatasetMetadata = (
		datasetId: string | undefined,
		metadata: object
	) => dispatch(deleteDatasetMetadataAction(datasetId, metadata));
	const getFolderPath = (folderId: string | null) =>
		dispatch(fetchFolderPath(folderId));

	const fetchFoldersFilesInDataset = (
		datasetId: string | undefined,
		folderId: string | null,
		skip: number | undefined,
		limit: number | undefined
	) =>
		dispatch(
			fetchFoldersFilesInDatasetAction(datasetId, folderId, skip, limit)
		);
	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchDatasetAbout(datasetId));
	const listDatasetLicense = (licenseId: string | undefined) =>
		dispatch(fetchDatasetLicense(licenseId));

	const listDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchDatasetMetadata(datasetId));
	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));

	// mapStateToProps
	const about = useSelector((state: RootState) => state.dataset.about);
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [enableAddMetadata, setEnableAddMetadata] =
		React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	const [paths, setPaths] = useState([]);

	const [currPageNum, setCurrPageNum] = useState<number>(1);

	const [editLicenseOpen, setEditLicenseOpen] = useState<boolean>(false);

	const [limit] = useState<number>(config.defaultFolderFilePerPage);

	const pageMetadata = useSelector(
		(state: RootState) => state.dataset.foldersAndFiles.metadata
	);
	const foldersFilesInDataset = useSelector(
		(state: RootState) => state.dataset.foldersAndFiles.data
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);
	const license = useSelector((state: RootState) => state.dataset.license);
	const [standardLicenseUrl, setStandardLicenseUrl] = useState<string>("");
	const fetchStandardLicenseUrlData = async (license_id: string) => {
		try {
			const data = await fetchStandardLicenseUrl(license_id); // Call your function to fetch licenses
			setStandardLicenseUrl(data); // Update state with the fetched data
		} catch (error) {
			console.error("Error fetching license url", error);
		}
	};

	useEffect(() => {
		fetchFoldersFilesInDataset(
			datasetId,
			folderId,
			(currPageNum - 1) * limit,
			limit
		);
		listDatasetAbout(datasetId);
		if (about.standard_license && about.license_id) {
			fetchStandardLicenseUrlData(about.license_id);
		}
		if (!about.standard_license && about.license_id)
			listDatasetLicense(about.license_id);
		getFolderPath(folderId);
		getMetadatDefinitions(null, 0, 100);
	}, [searchParams, adminMode, about.license_id]);

	// for breadcrumb
	useEffect(() => {
		// for breadcrumb
		const tmpPaths = [
			{
				name: about["name"],
				url: `/datasets/${datasetId}`,
			},
		];

		if (folderPath != null) {
			for (const folderBread of folderPath) {
				tmpPaths.push({
					name: folderBread["folder_name"],
					url: `/datasets/${datasetId}?folder=${folderBread["folder_id"]}`,
				});
			}
		} else {
			tmpPaths.slice(0, 1);
		}

		setPaths(tmpPaths);
	}, [about, folderPath]);

	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	const [openEditLicenseModal, setOpenEditLicenseModal] = useState(false);

	const handleOpenEditLicenseModal = () => {
		setOpenEditLicenseModal(true); // Open the modal
	};

	const handleCloseEditLicenseModal = (save: boolean) => {
		setOpenEditLicenseModal(false); // Close the modal
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		fetchFoldersFilesInDataset(datasetId, folderId, newSkip, limit);
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
				updateDatasetMetadata(datasetId, metadataRequestForms[key]);
			} else {
				// post new metadata if metadata id doesn"t exist
				createDatasetMetadata(datasetId, metadataRequestForms[key]);
			}
		});

		// reset the form
		setMetadataRequestForms({});

		// pulling lastest from the API endpoint
		listDatasetMetadata(datasetId);

		// switch to display mode
		setEnableAddMetadata(false);
	};

	// @ts-ignore
	// @ts-ignore
	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			<Grid container>
				{/*title*/}
				<Grid item xs={8} sx={{ display: "flex", alignItems: "center" }}>
					<Stack>
						<Box
							sx={{
								display: "inline-flex",
								justifyContent: "space-between",
								alignItems: "baseline",
							}}
						>
							<Typography variant="h3" paragraph>
								{about["name"]}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body1" paragraph>
								{about["description"]}
							</Typography>
						</Box>
					</Stack>
				</Grid>
				{/*actions*/}
				<Grid item xs={4} sx={{ display: "flex-top", alignItems: "center" }}>
					<ActionsMenu
						datasetId={datasetId}
						folderId={folderId}
						datasetName={about["name"]}
					/>
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
						scrollButtons="auto"
					>
						<Tab
							icon={<InsertDriveFile />}
							iconPosition="start"
							sx={TabStyle}
							label="Files"
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
							sx={
								authCheck(adminMode, datasetRole.role, [
									"owner",
									"editor",
									"uploader",
								])
									? TabStyle
									: { display: "none" }
							}
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
							sx={
								authCheck(adminMode, datasetRole.role, [
									"owner",
									"editor",
									"uploader",
								])
									? TabStyle
									: { display: "none" }
							}
							label="Sharing"
							{...a11yProps(6)}
							disabled={false}
						/>
					</Tabs>
					<TabPanel value={selectedTabIndex} index={0}>
						{folderId !== null ? (
							<Box>
								<MainBreadcrumbs paths={paths} />
							</Box>
						) : (
							<></>
						)}
						<FilesTable
							datasetId={datasetId}
							folderId={folderId}
							foldersFilesInDataset={foldersFilesInDataset}
							setCurrPageNum={setCurrPageNum}
							publicView={false}
						/>
						<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
							<Pagination
								count={Math.ceil(pageMetadata.total_count / limit)}
								page={currPageNum}
								onChange={handlePageChange}
								shape="rounded"
								variant="outlined"
							/>
						</Box>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						{enableAddMetadata &&
						datasetRole.role !== undefined &&
						datasetRole.role !== "viewer" ? (
							<>
								<EditMetadata
									resourceType="dataset"
									resourceId={datasetId}
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
									updateMetadata={updateDatasetMetadata}
									deleteMetadata={deleteDatasetMetadata}
									resourceType="dataset"
									resourceId={datasetId}
									publicView={false}
								/>
								<Box textAlign="center">
									{datasetRole.role !== undefined &&
									datasetRole.role !== "viewer" ? (
										<Button
											variant="contained"
											sx={{ m: 2 }}
											onClick={() => {
												setEnableAddMetadata(true);
											}}
										>
											Add Metadata
										</Button>
									) : (
										<></>
									)}
								</Box>
							</>
						)}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						<DisplayListenerMetadata
							updateMetadata={updateDatasetMetadata}
							deleteMetadata={deleteDatasetMetadata}
							resourceType="dataset"
							resourceId={datasetId}
						/>
					</TabPanel>
					{datasetRole.role !== undefined && datasetRole.role !== "viewer" ? (
						<TabPanel value={selectedTabIndex} index={3}>
							<Listeners datasetId={datasetId} process={"dataset"} />
						</TabPanel>
					) : (
						<></>
					)}
					<TabPanel value={selectedTabIndex} index={4}>
						<ExtractionHistoryTab datasetId={datasetId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={5}>
						<Visualization datasetId={datasetId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={6}>
						<SharingTab datasetId={datasetId} />
					</TabPanel>
				</Grid>
				<Grid item>
					<Typography variant="h5" gutterBottom>
						License
					</Typography>
					{about.standard_license && about.license_id !== undefined ? (
						<Typography>
							<Link href={standardLicenseUrl} target="_blank">
								<img
									className="logo"
									src={`public/${about.license_id}.png`}
									alt={about.license_id}
								/>
							</Link>
						</Typography>
					) : (
						<></>
					)}
					{!about.standard_license &&
					license !== undefined &&
					license.name !== undefined ? (
						<div>
							<Typography>
								<Link href={license.url} target="_blank">
									{license.name}
								</Link>
								<IconButton
									onClick={() => {
										setEditLicenseOpen(true);
									}}
								>
									<EditIcon />
								</IconButton>
							</Typography>
							<Dialog
								open={editLicenseOpen}
								onClose={() => {
									setOpenEditLicenseModal(false);
								}}
								fullWidth={true}
								maxWidth="md"
								aria-labelledby="form-dialog"
							>
								<DialogTitle>Edit license</DialogTitle>
								<DialogContent>
									<EditLicenseModal setEditLicenseOpen={setEditLicenseOpen} />
								</DialogContent>
							</Dialog>
						</div>
					) : (
						<></>
					)}
					<DatasetDetails details={about} myRole={datasetRole.role} />
				</Grid>
			</Grid>
		</Layout>
	);
};
