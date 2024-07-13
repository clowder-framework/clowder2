// lazy loading
import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	Grid,
	Link,
	Pagination,
	Snackbar,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicFolderPath } from "../../actions/folder";
import {
	fetchPublicDatasetAbout,
	fetchPublicFoldersFilesInDataset as fetchPublicFoldersFilesInDatasetAction,
} from "../../actions/public_dataset";
import { a11yProps, TabPanel } from "../tabs/TabComponent";
import FilesTable from "../files/FilesTable";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import {
	deleteDatasetMetadata as deleteDatasetMetadataAction,
	fetchPublicMetadataDefinitions,
	patchDatasetMetadata as patchDatasetMetadataAction,
} from "../../actions/metadata";
import PublicLayout from "../PublicLayout";
import { PublicActionsMenu } from "./PublicActionsMenu";
import { DatasetDetails } from "./DatasetDetails";
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import { Listeners } from "../listeners/Listeners";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { TabStyle } from "../../styles/Styles";
import { ErrorModal } from "../errors/ErrorModal";
import { Visualization } from "../visualizations/Visualization";
import VisibilityIcon from "@mui/icons-material/Visibility";
import config from "../../app.config";
import { FreezeVersionChip } from "../versions/FeezeVersionChip";
import { PublicDatasetVersions } from "./versions/PublicDatasetVersions";
import { fetchPublicStandardLicenseUrl } from "../../utils/licenses";

export const PublicDataset = (): JSX.Element => {
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
	const deleteDatasetMetadata = (
		datasetId: string | undefined,
		metadata: object
	) => dispatch(deleteDatasetMetadataAction(datasetId, metadata));
	const getPublicFolderPath = (folderId: string | null) =>
		dispatch(fetchPublicFolderPath(folderId));
	const fetchPublicFoldersFilesInDataset = (
		datasetId: string | undefined,
		folderId: string | null,
		skip: number | undefined,
		limit: number | undefined
	) =>
		dispatch(
			fetchPublicFoldersFilesInDatasetAction(datasetId, folderId, skip, limit)
		);
	const listPublicDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchPublicDatasetAbout(datasetId));
	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchPublicMetadataDefinitions(name, skip, limit));

	// mapStateToProps
	const dataset = useSelector(
		(state: RootState) => state.publicDataset.publicAbout
	);
	const publicFolderPath = useSelector(
		(state: RootState) => state.folder.publicFolderPath
	);
	const license = useSelector((state: RootState) => state.dataset.license);
	const [standardLicenseUrl, setStandardLicenseUrl] = useState<string>("");
	const fetchStandardLicenseUrlData = async (license_id: string) => {
		try {
			const data = await fetchPublicStandardLicenseUrl(license_id); // Call your function to fetch licenses
			setStandardLicenseUrl(data); // Update state with the fetched data
		} catch (error) {
			console.error("Error fetching license url", error);
		}
	};

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [errorOpen, setErrorOpen] = useState(false);
	const [paths, setPaths] = useState([]);
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultFolderFilePerPage);

	// Snackbar
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");

	const pageMetadata = useSelector(
		(state: RootState) => state.publicDataset.publicFoldersAndFiles.metadata
	);
	const publicFoldersAndFiles = useSelector(
		(state: RootState) => state.publicDataset.publicFoldersAndFiles.data
	);

	// component did mount list all files in dataset
	useEffect(() => {
		fetchPublicFoldersFilesInDataset(
			datasetId,
			folderId,
			(currPageNum - 1) * limit,
			limit
		);
		listPublicDatasetAbout(datasetId);
		getPublicFolderPath(folderId);
		getMetadatDefinitions(null, 0, 100);
	}, [datasetId, searchParams]);

	useEffect(() => {
		if (dataset && dataset.license_id !== undefined)
			fetchStandardLicenseUrlData(dataset.license_id);

		if (dataset.frozen && dataset.id !== dataset.origin_id) {
			setSnackBarOpen(true);
			setSnackBarMessage(
				`Viewing dataset version ${dataset.frozen_version_num}.`
			);
		}
	}, [dataset]);

	// for breadcrumb
	useEffect(() => {
		// for breadcrumb
		const tmpPaths = [
			{
				name: dataset["name"],
				url: `/public_datasets/${datasetId}`,
			},
		];

		if (publicFolderPath != null) {
			for (const folderBread of publicFolderPath) {
				tmpPaths.push({
					name:
						folderBread && folderBread["folder_name"]
							? folderBread["folder_name"]
							: "",
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

		setPaths(tmpPaths);
	}, [dataset, publicFolderPath]);

	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		fetchPublicFoldersFilesInDataset(datasetId, folderId, newSkip, limit);
	};

	return (
		<PublicLayout>
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
						<Grid item>
							<FreezeVersionChip
								frozenVersionNum={dataset.frozen_version_num}
								frozen={dataset.frozen}
							/>
						</Grid>
						<Grid item xs>
							<Box>
								<Typography variant="h5" paragraph sx={{ marginBottom: 0 }}>
									{dataset["name"]}
								</Typography>
								<Typography variant="body1" paragraph>
									{dataset["description"]}
								</Typography>
							</Box>
						</Grid>
					</Grid>
				</Grid>
				{/*actions*/}
				<Grid item xs={4} sx={{ display: "flex-top", alignItems: "center" }}>
					<PublicActionsMenu datasetId={datasetId} />
				</Grid>
				{/*actions*/}
			</Grid>
			<Grid container spacing={2} sx={{ mt: 2 }}>
				<Grid item xs={12} sm={12} md={10} lg={10} xl={10}>
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
							foldersFilesInDataset={publicFoldersAndFiles}
							setCurrPageNum={setCurrPageNum}
							publicView={true}
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
						<Visualization datasetId={datasetId} />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						<DisplayMetadata
							updateMetadata={updateDatasetMetadata}
							deleteMetadata={deleteDatasetMetadata}
							resourceType="dataset"
							resourceId={datasetId}
							publicView={true}
						/>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={3}>
						<DisplayListenerMetadata
							updateMetadata={updateDatasetMetadata}
							deleteMetadata={deleteDatasetMetadata}
							resourceType="dataset"
							resourceId={datasetId}
							publicView={true}
						/>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}>
						<Listeners datasetId={datasetId} />
					</TabPanel>
				</Grid>
				<Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
					<PublicDatasetVersions currDataset={dataset} />
					<Typography variant="h5" gutterBottom>
						License
					</Typography>
					{dataset.standard_license && dataset.license_id !== undefined ? (
						<Typography>
							<Link href={standardLicenseUrl} target="_blank">
								<img
									className="logo"
									src={`public/${dataset.license_id}.png`}
									alt={dataset.license_id}
								/>
							</Link>
						</Typography>
					) : (
						<></>
					)}
					{!dataset.standard_license &&
					license !== undefined &&
					license.name !== undefined ? (
						<div>
							<Typography>
								<Link href={license.url} target="_blank">
									{license.name}
								</Link>
							</Typography>
						</div>
					) : (
						<></>
					)}
					<DatasetDetails details={dataset} />
				</Grid>
			</Grid>
		</PublicLayout>
	);
};
