// lazy loading
import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	FormControl,
	Grid,
	Link,
	MenuItem,
	Pagination,
	Snackbar,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchDatasetLicense,
	fetchFoldersFilesInDataset as fetchFoldersFilesInDatasetAction,
	getFreezeDatasetLatest as getFreezeDatasetLatestAction,
	getFreezeDatasetVersion as getFreezeDatasetVersionAction,
} from "../../actions/dataset";
import { fetchFolderPath } from "../../actions/folder";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import FilesTable from "../files/FilesTable";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import {
	fetchDatasetMetadata,
	fetchMetadataDefinitions,
} from "../../actions/metadata";
import Layout from "../Layout";
import { ActionsMenuGroup } from "./ActionsMenuGroup";
import { DatasetDetails } from "./DatasetDetails";
import { FormatListBulleted, InsertDriveFile } from "@material-ui/icons";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { TabStyle } from "../../styles/Styles";
import { ErrorModal } from "../errors/ErrorModal";
import config from "../../app.config";
import { fetchStandardLicenseUrl } from "../../utils/licenses";
import { ClowderSelect } from "../styledComponents/ClowderSelect";

export const DatasetFreeze = (): JSX.Element => {
	// path parameter
	const { datasetId } = useParams<{ datasetId?: string }>();
	const { frozenVersionNum } = useParams<{ frozenVersionNum?: string }>();

	// search parameters
	const [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");
	// Redux connect equivalent
	const dispatch = useDispatch();
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
	const listDatasetLicense = (licenseId: string | undefined) =>
		dispatch(fetchDatasetLicense(licenseId));

	const listDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchDatasetMetadata(datasetId));
	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));

	const getFreezeDatasetLatestVersionNum = (datasetId: string | undefined) =>
		dispatch(getFreezeDatasetLatestAction(datasetId));
	const getFreezeDatasetVersion = (
		datasetId: string | undefined,
		frozenVersionNum: string
	) => dispatch(getFreezeDatasetVersionAction(datasetId, frozenVersionNum));

	// mapStateToProps
	const latestFrozenVersionNum = useSelector(
		(state: RootState) => state.dataset.latestFrozenVersionNum
	);
	const frozenDataset = useSelector(
		(state: RootState) => state.dataset.frozenDataset
	);

	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);

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

	const [selectedDatasetVersionNum, setSelectedDatasetVersionNum] =
		useState<string>("current");

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
		getFreezeDatasetLatestVersionNum(datasetId);
	}, []);

	useEffect(() => {
		getFreezeDatasetVersion(datasetId, frozenVersionNum);
		// fetchFoldersFilesInDataset(
		// 	datasetId,
		// 	folderId,
		// 	(currPageNum - 1) * limit,
		// 	limit
		// );
		// listDatasetAbout(datasetId);
		// if (frozenDataset.standard_license && frozenDataset.license_id) {
		// 	fetchStandardLicenseUrlData(frozenDataset.license_id);
		// }
		// if (!frozenDataset.standard_license && frozenDataset.license_id)
		// 	listDatasetLicense(frozenDataset.license_id);
		// getFolderPath(folderId);
		// getMetadatDefinitions(null, 0, 100);
	}, [searchParams, adminMode, datasetId, frozenVersionNum]);

	// TODO change this to a modal
	useEffect(() => {
		if (latestFrozenVersionNum && latestFrozenVersionNum > 0) {
			setSnackBarOpen(true);
			setSnackBarMessage(
				`The most recent locked version of the dataset is numbered ${latestFrozenVersionNum}.`
			);
		}
	}, [latestFrozenVersionNum]);

	// for breadcrumb
	useEffect(() => {
		// for breadcrumb
		const tmpPaths = [
			{
				name: frozenDataset["name"],
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
	}, [frozenDataset, folderPath]);

	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		fetchFoldersFilesInDataset(datasetId, folderId, newSkip, limit);
	};

	// @ts-ignore
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
					<Stack>
						<Box
							sx={{
								display: "inline-flex",
								justifyContent: "space-between",
								alignItems: "baseline",
							}}
						>
							<Typography variant="h3" paragraph>
								{frozenDataset["name"]}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body1" paragraph>
								{frozenDataset["description"]}
							</Typography>
						</Box>
					</Stack>
				</Grid>
				{/*actions*/}
				<Grid item xs={4} sx={{ display: "flex-top", alignItems: "center" }}>
					<ActionsMenuGroup dataset={frozenDataset} folderId={folderId} />
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
						<DisplayMetadata
							resourceType="dataset"
							resourceId={datasetId}
							publicView={false}
						/>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						<DisplayListenerMetadata
							resourceType="dataset"
							resourceId={datasetId}
						/>
					</TabPanel>
				</Grid>
				<Grid item>
					<Typography variant="h5" gutterBottom>
						License
					</Typography>
					{frozenDataset.standard_license &&
					frozenDataset.license_id !== undefined ? (
						<Typography>
							<Link href={standardLicenseUrl} target="_blank">
								<img
									className="logo"
									src={`public/${frozenDataset.license_id}.png`}
									alt={frozenDataset.license_id}
								/>
							</Link>
						</Typography>
					) : (
						<></>
					)}
					{!frozenDataset.standard_license &&
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
					<DatasetDetails details={frozenDataset} myRole={datasetRole.role} />
					<Typography sx={{ wordBreak: "break-all" }}>
						Dataset Version
					</Typography>
					<FormControl>
						<ClowderSelect
							value={selectedDatasetVersionNum.toString()}
							onChange={(event) => {
								setSelectedDatasetVersionNum(event.target.value);
								setSnackBarMessage(
									`Viewing dataset version ${event.target.value}.`
								);
								setSnackBarOpen(true);
							}}
						>
							<MenuItem value="current" key="current">
								Current
							</MenuItem>
							{VersionOptions(latestFrozenVersionNum)}
						</ClowderSelect>
					</FormControl>
				</Grid>
			</Grid>
		</Layout>
	);
};

function VersionOptions(latestFrozenVersionNum: number) {
	if (latestFrozenVersionNum <= 0) {
		return null;
	}

	return Array.from({ length: latestFrozenVersionNum }, (_, i) => (
		<MenuItem key={(i + 1).toString()} value={(i + 1).toString()}>
			{i + 1}
		</MenuItem>
	));
}
