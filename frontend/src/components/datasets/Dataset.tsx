import React, {useEffect, useState} from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	IconButton,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";
import {ClowderButton} from "../styledComponents/ClowderButton";
import {useParams, useSearchParams} from "react-router-dom";
import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchDatasetAbout, fetchFilesInDataset, fetchFoldersInDataset, updateDataset} from "../../actions/dataset";
import {fetchFolderPath} from "../../actions/folder";
import {resetFailedReason,} from "../../actions/common"

import {a11yProps, TabPanel} from "../tabs/TabComponent";
import {MainBreadcrumbs} from "../navigation/BreadCrumb";
import {ActionModal} from "../dialog/ActionModal";
import FilesTable from "../files/FilesTable";
import config from "../../app.config";
import {DatasetIn, MetadataIn} from "../../openapi/v2";
import {DisplayMetadata} from "../metadata/DisplayMetadata";
import {CreateMetadataDefinition} from "../metadata/CreateMetadataDefinition";
import {EditMetadata} from "../metadata/EditMetadata";
import {
	deleteDatasetMetadata as deleteDatasetMetadataAction,
	fetchDatasetMetadata,
	patchDatasetMetadata as patchDatasetMetadataAction,
	postDatasetMetadata
} from "../../actions/metadata";
import CloseIcon from '@mui/icons-material/Close';
import Layout from "../Layout";
import {ActionsMenu} from "./ActionsMenu";
import {DatasetDetails} from "./DatasetDetails";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

export const Dataset = (): JSX.Element => {

	// path parameter
	const {datasetId} = useParams<{ datasetId?: string }>();

	// search parameters
	let [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");

	// Redux connect equivalent
	const dispatch = useDispatch();
	const editDataset = (datasetId: string | undefined, formData: DatasetIn) => dispatch(updateDataset(datasetId, formData));
	const updateDatasetMetadata = (datasetId: string | undefined, content: object) => dispatch(patchDatasetMetadataAction(datasetId, content));
	const createDatasetMetadata = (datasetId: string | undefined, metadata: MetadataIn) => dispatch(postDatasetMetadata(datasetId, metadata));
	const deleteDatasetMetadata = (datasetId: string | undefined, metadata: object) => dispatch(deleteDatasetMetadataAction(datasetId, metadata));
	const getFolderPath = (folderId: string | null) => dispatch(fetchFolderPath(folderId));
	const listFilesInDataset = (datasetId: string | undefined, folderId: string | null) => dispatch(fetchFilesInDataset(datasetId, folderId));
	const listFoldersInDataset = (datasetId: string | undefined, parentFolder: string | null) => dispatch(fetchFoldersInDataset(datasetId, parentFolder));
	const listDatasetAbout = (datasetId: string | undefined) => dispatch(fetchDatasetAbout(datasetId));
	const listDatasetMetadata = (datasetId: string | undefined) => dispatch(fetchDatasetMetadata(datasetId));
	const dismissError = () => dispatch(resetFailedReason());

	// mapStateToProps
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);
	const about = useSelector((state: RootState) => state.dataset.about);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);


	const [editDescriptionOpen, setEditDescriptionOpen] = React.useState<boolean>(false);
	const [datasetDescription, setDatasetDescription] = React.useState<string>("");
	const [enableAddMetadata, setEnableAddMetadata] = React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});
	const [openPopup, setOpenPopup] = React.useState<boolean>(false)

	// component did mount list all files in dataset
	useEffect(() => {
		listFilesInDataset(datasetId, folderId);
		listFoldersInDataset(datasetId, folderId);
		listDatasetAbout(datasetId);
		getFolderPath(folderId);
	}, [searchParams]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);

		}
	}, [reason])
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	}
	const handleErrorReport = (reason: string) => {
		window.open(`${config.GHIssueBaseURL}+${reason}&body=${encodeURIComponent(stack)}`);
	}

	const handleTabChange = (_event: React.ChangeEvent<{}>, newTabIndex: number) => {
		setSelectedTabIndex(newTabIndex);
	};

	const setMetadata = (metadata: any) => {
		// TODO wrap this in to a function
		setMetadataRequestForms(prevState => {
			// merge the contents field; e.g. lat lon
			if (metadata.definition in prevState) {
				const prevContent = prevState[metadata.definition].contents;
				metadata.contents = {...prevContent, ...metadata.contents};
			}
			return ({...prevState, [metadata.definition]: metadata});
		});
	};

	const handleMetadataUpdateFinish = () => {
		Object.keys(metadataRequestForms).map(key => {
			if ("id" in metadataRequestForms[key] && metadataRequestForms[key]["id"] !== undefined
				&& metadataRequestForms[key]["id"] !== null
				&& metadataRequestForms[key]["id"] !== "") {
				// update existing metadata
				updateDatasetMetadata(datasetId, metadataRequestForms[key]);
			} else {
				// post new metadata if metadata id doesn't exist
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
			"name": "Explore",
			"url": "/",
		},
		{
			"name": about["name"],
			"url": `/datasets/${datasetId}`
		}
	];

	if (folderPath != null) {
		for (const folderBread of folderPath) {
			paths.push({
				"name": folderBread["folder_name"],
				"url": `/datasets/${datasetId}?folder=${folderBread["folder_id"]}`
			})
		}
	} else {
		paths.slice(0, 1)
	}

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
						 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
						 handleActionCancel={handleErrorCancel}/>
			<Grid container>
				<Grid item xs={8} sx={{display: 'flex', alignItems: 'center'}}>
					<MainBreadcrumbs paths={paths}/>
				</Grid>
				<Grid item xs={4}>
					<ActionsMenu datasetId={datasetId} folderId={folderId}/>
				</Grid>
			</Grid>
			<Grid container spacing={2}>
				<Grid item xs={10}>
					<Typography variant="h3" paragraph>{about["name"]}</Typography>
					<Typography variant="body1" paragraph>{about["description"]}</Typography>
					<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dataset tabs">
						<Tab sx={tab} label="Files" {...a11yProps(0)} />
						<Tab sx={tab} label="Metadata" {...a11yProps(1)} disabled={false}/>
					</Tabs>
					<TabPanel value={selectedTabIndex} index={0}>
						<FilesTable datasetId={datasetId}/>
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						{
							enableAddMetadata ?
								<>
									<IconButton color="primary" aria-label="close"
												onClick={() => {
													setEnableAddMetadata(false);
												}}
												sx={{float: "right"}}
									>
										<CloseIcon/>
									</IconButton>
									<Button variant="contained" onClick={() => {
										setOpenPopup(true);
									}} sx={{mt: 1, mr: 1, "alignItems": "right"}}>
										Add new metadata definition
									</Button>
									<EditMetadata resourceType="dataset" resourceId={datasetId}
												  setMetadata={setMetadata}
									/>
									<Button variant="contained" onClick={handleMetadataUpdateFinish}
											sx={{mt: 1, mr: 1}}>
										Update
									</Button>
									<Button onClick={() => {
										setEnableAddMetadata(false);
									}}
											sx={{mt: 1, mr: 1}}>
										Cancel
									</Button>
									{
										openPopup ?
											<>
												<Dialog open={openPopup} onClose={() => {
													setOpenPopup(false);
												}} fullWidth={true} maxWidth={"md"}>
													<DialogTitle>Add new metadata definition</DialogTitle>
													<DialogContent>
														<DialogContentText>Please fill out the metadata
															information here.</DialogContentText>
														<CreateMetadataDefinition/>
													</DialogContent>
													<DialogActions>
														<Button onClick={() => {
															setOpenPopup(false);
														}}>Cancel</Button>
													</DialogActions>
												</Dialog>
											</>
											: <></>
									}
								</>
								:
								<>
									<Grid container spacing={2} sx={{"alignItems": "center"}}>
										<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
											<ClowderButton onClick={() => {
												setEnableAddMetadata(true);
											}}>
												Add/Edit Metadata
											</ClowderButton>
										</Grid>
									</Grid>
									<DisplayMetadata updateMetadata={updateDatasetMetadata}
													 deleteMetadata={deleteDatasetMetadata}
													 resourceType="dataset" resourceId={datasetId}/>
								</>

						}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}/>
					<TabPanel value={selectedTabIndex} index={3}/>
					<TabPanel value={selectedTabIndex} index={4}/>
				</Grid>
				<Grid item>
					<DatasetDetails details={about}/>
				</Grid>
			</Grid>
		</Layout>
	)
}
