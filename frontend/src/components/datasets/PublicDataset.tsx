// lazy loading
import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	ButtonGroup,
	Grid,
	Stack,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchDatasetAbout,
	fetchFoldersInDataset,
} from "../../actions/dataset";
import { fetchFolderPath } from "../../actions/folder";

import {
	fetchFilesInPublicDataset,
	fetchFoldersInPublicDataset,
	fetchPublicDatasetAbout,
} from "../../actions/public_dataset";

import { a11yProps, TabPanel } from "../tabs/TabComponent";
import FilesTable from "../files/FilesTable";
import { MetadataIn } from "../../openapi/v2";
import { DisplayMetadata } from "../metadata/DisplayMetadata";
import { DisplayListenerMetadata } from "../metadata/DisplayListenerMetadata";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import {
	deleteDatasetMetadata as deleteDatasetMetadataAction,
	fetchDatasetMetadata,
	fetchMetadataDefinitions,
	patchDatasetMetadata as patchDatasetMetadataAction,
	postDatasetMetadata,
} from "../../actions/metadata";
import PublicLayout from "../PublicLayout";
import { PublicActionsMenu } from "./PublicActionsMenu";
import { DatasetDetails } from "./DatasetDetails";
import {
	ArrowBack,
	ArrowForward,
	FormatListBulleted,
	InsertDriveFile,
} from "@material-ui/icons";
import { Listeners } from "../listeners/Listeners";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { TabStyle } from "../../styles/Styles";
import { Forbidden } from "../errors/Forbidden";
import { PageNotFound } from "../errors/PageNotFound";
import { ErrorModal } from "../errors/ErrorModal";
import { Visualization } from "../visualizations/Visualization";
import VisibilityIcon from "@mui/icons-material/Visibility";

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
	const listFilesPublicInDataset = (
		datasetId: string | undefined,
		folderId: string | null,
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchFilesInPublicDataset(datasetId, folderId, skip, limit));
	const listFoldersInDataset = (
		datasetId: string | undefined,
		parentFolder: string | null,
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchFoldersInDataset(datasetId, parentFolder, skip, limit));
	const listFoldersInPublicDataset = (
		datasetId: string | undefined,
		parentFolder: string | null,
		skip: number | undefined,
		limit: number | undefined
	) =>
		dispatch(fetchFoldersInPublicDataset(datasetId, parentFolder, skip, limit));
	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchDatasetAbout(datasetId));
	const listPublicDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchPublicDatasetAbout(datasetId));
	const listDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchDatasetMetadata(datasetId));
	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));

	// mapStateToProps
	const about = useSelector(
		(state: RootState) => state.publicDataset.public_about
	);
	// const datasetRole = useSelector(
	// 	(state: RootState) => state.dataset.datasetRole
	// );
	const folderPath = useSelector(
		(state: RootState) => state.folder.publicFolderPath
	);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [enableAddMetadata, setEnableAddMetadata] =
		React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});

	const [allowSubmit, setAllowSubmit] = React.useState<boolean>(false);
	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	const [showForbiddenPage, setShowForbiddenPage] = useState(false);
	const [showNotFoundPage, setShowNotFoundPage] = useState(false);

	const [paths, setPaths] = useState([]);

	// TODO add option to determine limit number; default show 20 files each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit] = useState<number>(10);
	const [skip, setSkip] = useState<number | undefined>(0);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	// we use the public files here
	const filesInDataset = useSelector(
		(state: RootState) => state.publicDataset.public_files
	);

	const foldersInDataset = useSelector(
		(state: RootState) => state.folder.folders
	);
	const publicFoldersInDataset = useSelector(
		(state: RootState) => state.folder.publicFolders
	);
	const metadataDefinitionList = useSelector(
		(state: RootState) => state.metadata.metadataDefinitionList
	);

	// component did mount list all files in dataset
	useEffect(() => {
		listFilesPublicInDataset(datasetId, folderId, skip, limit);
		// listFoldersInDataset(datasetId, folderId, skip, limit);
		listFoldersInPublicDataset(datasetId, folderId, skip, limit);
		// listDatasetAbout(datasetId);
		listPublicDatasetAbout(datasetId);
		getFolderPath(folderId);
	}, [searchParams]);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	useEffect(() => {
		// disable flipping if reaches the last page
		if (filesInDataset.length < limit && foldersInDataset.length < limit)
			setNextDisabled(true);
		else setNextDisabled(false);
	}, [filesInDataset]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listFilesPublicInDataset(datasetId, folderId, skip, limit);
			// listFoldersInDataset(datasetId, folderId, skip, limit);
			listFoldersInPublicDataset(datasetId, folderId, skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	// for breadcrumb
	useEffect(() => {
		// for breadcrumb
		const tmpPaths = [
			{
				name: about["name"],
				url: `/public_datasets/${datasetId}`,
			},
		];

		if (folderPath != null) {
			for (const folderBread of folderPath) {
				tmpPaths.push({
					name: folderBread["folder_name"],
					url: `/public_datasets/${datasetId}?folder=${folderBread["folder_id"]}`,
				});
			}
		} else {
			tmpPaths.slice(0, 1);
		}

		setPaths(tmpPaths);
	}, [about, folderPath]);

	// for pagination keep flipping until the return dataset is less than the limit
	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (filesInDataset.length === limit || foldersInDataset.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

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

	if (showForbiddenPage) {
		return <Forbidden />;
	} else if (showNotFoundPage) {
		return <PageNotFound />;
	}

	return (
		<PublicLayout>
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
						<Box>{/*<RoleChip role={datasetRole.role} />*/}</Box>
					</Stack>
				</Grid>
				{/*actions*/}
				<Grid item xs={4} sx={{ display: "flex-top", alignItems: "center" }}>
					<PublicActionsMenu
						datasetId={datasetId}
						folderId={folderId}
						datasetName={about["name"]}
					/>
				</Grid>
				{/*actions*/}
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
							filesInDataset={filesInDataset}
							foldersInDataset={foldersInDataset}
							publicView={true}
						/>
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
					{/*<TabPanel value={selectedTabIndex} index={6}>*/}
					{/*	<SharingTab datasetId={datasetId} />*/}
					{/*</TabPanel>*/}
					<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
						<ButtonGroup variant="contained" aria-label="previous next buttons">
							<Button
								aria-label="previous"
								onClick={previous}
								disabled={prevDisabled}
							>
								<ArrowBack /> Prev
							</Button>
							<Button aria-label="next" onClick={next} disabled={nextDisabled}>
								Next <ArrowForward />
							</Button>
						</ButtonGroup>
					</Box>
				</Grid>
				<Grid item>
					<DatasetDetails details={about} />
				</Grid>
			</Grid>
		</PublicLayout>
	);
};
