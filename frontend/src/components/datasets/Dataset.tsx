// lazy loading
import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchDatasetAbout,
	fetchFilesInDataset,
	fetchFoldersInDataset,
} from "../../actions/dataset";
import { fetchFolderPath } from "../../actions/folder";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import FilesTable from "../files/FilesTable";
import { MetadataIn } from "../../openapi/v2";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import { EditMetadata } from "../metadata/EditMetadata";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import {
	deleteDatasetMetadata as deleteDatasetMetadataAction,
	fetchDatasetMetadata,
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
import { Forbidden } from "../errors/Forbidden";
import { PageNotFound } from "../errors/PageNotFound";
import { ErrorModal } from "../errors/ErrorModal";
import { Visualization } from "../visualizations/Visualization";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
	const listFilesInDataset = (
		datasetId: string | undefined,
		folderId: string | null
	) => dispatch(fetchFilesInDataset(datasetId, folderId));
	const listFoldersInDataset = (
		datasetId: string | undefined,
		parentFolder: string | null
	) => dispatch(fetchFoldersInDataset(datasetId, parentFolder));
	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchDatasetAbout(datasetId));
	const listDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchDatasetMetadata(datasetId));

	// mapStateToProps
	const about = useSelector((state: RootState) => state.dataset.about);
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [enableAddMetadata, setEnableAddMetadata] =
		React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});

	const [allowSubmit, setAllowSubmit] = React.useState<boolean>(false);

	// component did mount list all files in dataset
	useEffect(() => {
		listFilesInDataset(datasetId, folderId);
		listFoldersInDataset(datasetId, folderId);
		listDatasetAbout(datasetId);
		getFolderPath(folderId);
	}, [searchParams]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	const [showForbiddenPage, setShowForbiddenPage] = useState(false);
	const [showNotFoundPage, setShowNotFoundPage] = useState(false);

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
							<RoleChip role={datasetRole.role} />
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
			</Grid>
			<Grid container spacing={2} sx={{ mt: 2 }}>
				<Grid item xs={10}>
					<Typography variant="body1" paragraph>
						{about["description"]}
					</Typography>
					<Tabs
						value={selectedTabIndex}
						onChange={handleTabChange}
						aria-label="dataset tabs"
					>
						<Tab
							icon={<InsertDriveFile />}
							iconPosition="start"
							sx={TabStyle}
							label="Files"
							{...a11yProps(0)}
						/>
						<Tab
							icon={<VisibilityIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Visualizations"
							{...a11yProps(1)}
							disabled={false}
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
						<Tab
							icon={<ShareIcon />}
							iconPosition="start"
							sx={TabStyle}
							label="Sharing"
							{...a11yProps(6)}
							disabled={false}
						/>
					</Tabs>
					{folderId !== null ? (
						<Box style={{ padding: "24px 24px 0 24px" }}>
							<MainBreadcrumbs paths={paths}></MainBreadcrumbs>
						</Box>
					) : (
						<></>
					)}
					<TabPanel value={selectedTabIndex} index={0}>
						<FilesTable datasetId={datasetId} folderId={folderId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						<Visualization datasetId={datasetId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						{enableAddMetadata ? (
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
							updateMetadata={updateDatasetMetadata}
							deleteMetadata={deleteDatasetMetadata}
							resourceType="dataset"
							resourceId={datasetId}
						/>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}>
						<Listeners datasetId={datasetId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={5}>
						<ExtractionHistoryTab datasetId={datasetId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={6}>
						<SharingTab datasetId={datasetId} />
					</TabPanel>
				</Grid>
				<Grid item>
					<DatasetDetails details={about} />
				</Grid>
			</Grid>
		</Layout>
	);
};
