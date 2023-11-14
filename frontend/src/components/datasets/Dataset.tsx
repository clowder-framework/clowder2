// lazy loading
import React, { useEffect, useState } from "react";
import {Box, Button, ButtonGroup, Grid, Stack, Tab, Tabs, Typography} from "@mui/material";
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
	fetchDatasetMetadata, fetchMetadataDefinitions,
	patchDatasetMetadata as patchDatasetMetadataAction,
	postDatasetMetadata,
} from "../../actions/metadata";
import Layout from "../Layout";
import { ActionsMenu } from "./ActionsMenu";
import { DatasetDetails } from "./DatasetDetails";
import {ArrowBack, ArrowForward, FormatListBulleted, InsertDriveFile} from "@material-ui/icons";
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
import {DatasetLayout} from "./DatasetLayout";

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
		, skip: number | undefined, limit: number | undefined) => dispatch(fetchFilesInDataset(datasetId, folderId, skip, limit));
	const listFoldersInDataset = (
		datasetId: string | undefined,
		parentFolder: string | null,
		skip: number | undefined, limit: number | undefined
	) => dispatch(fetchFoldersInDataset(datasetId, parentFolder, skip, limit));
	const listDatasetAbout = (datasetId: string | undefined) =>
		dispatch(fetchDatasetAbout(datasetId));
	const listDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchDatasetMetadata(datasetId));
	const getMetadatDefinitions = (name:string|null, skip:number, limit:number) => dispatch(fetchMetadataDefinitions(name, skip,limit));


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
	const filesInDataset = useSelector((state: RootState) => state.dataset.files);
	const foldersInDataset = useSelector((state: RootState) => state.folder.folders);


	const metadataDefinitionList = useSelector((state: RootState) => state.metadata.metadataDefinitionList);

	// component did mount list all files in dataset
	useEffect(() => {
		listFilesInDataset(datasetId, folderId, skip, limit);
		listFoldersInDataset(datasetId, folderId, skip, limit);
		listDatasetAbout(datasetId);
		getFolderPath(folderId);
	}, [searchParams]);

	useEffect(() => {
		getMetadatDefinitions(null, 0, 100);
	}, []);

	useEffect(() => {
		// disable flipping if reaches the last page
		if (filesInDataset.length < limit && foldersInDataset.length < limit)
			setNextDisabled(true);
		else
			setNextDisabled(false);
	}, [filesInDataset]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listFilesInDataset(datasetId, folderId, skip, limit);
			listFoldersInDataset(datasetId, folderId, skip, limit);
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
		<DatasetLayout></DatasetLayout>
	);
};
