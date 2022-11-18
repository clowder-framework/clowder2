import React, {useEffect, useState} from "react";
import config from "../../app.config";
import {Button, Grid, IconButton, Tab, Tabs, Typography} from "@mui/material";
import {downloadResource, parseDate} from "../../utils/common";
import {PreviewConfiguration, RootState} from "../../types/data";
import {useLocation, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {resetFailedReason} from "../../actions/common"

import {a11yProps, TabPanel} from "../tabs/TabComponent";
import {fetchFileSummary, fetchFileVersions, fileDownloaded} from "../../actions/file";
import {MainBreadcrumbs} from "../navigation/BreadCrumb";
import {ActionModal} from "../dialog/ActionModal";
import {FileVersionHistory} from "../versions/FileVersionHistory";
import {DisplayMetadata} from "../metadata/DisplayMetadata";
import {
	deleteFileMetadata as deleteFileMetadataAction,
	fetchFileMetadata,
	patchFileMetadata as patchFileMetadataAction,
	postFileMetadata as createFileMetadataAction
} from "../../actions/metadata";
import {EditMetadata} from "../metadata/EditMetadata";
import {ClowderButton} from "../styledComponents/ClowderButton";
import CloseIcon from "@mui/icons-material/Close";
import Layout from "../Layout";
import {fetchDatasetAbout} from "../../actions/dataset";
import {Download} from "@mui/icons-material";
import {FileDetail} from "./FileDetail";

export const File = (): JSX.Element => {

	// path parameter
	const {fileId} = useParams<{ fileId?: string }>();

	// query parameter get dataset id
	const search = useLocation().search;
	const datasetId = new URLSearchParams(search).get("dataset");
	const listDatasetAbout = (datasetId: string | undefined) => dispatch(fetchDatasetAbout(datasetId));
	const about = useSelector((state: RootState) => state.dataset.about);

	const dispatch = useDispatch();
	const listFileSummary = (fileId: string | undefined) => dispatch(fetchFileSummary(fileId));
	const listFileVersions = (fileId: string | undefined) => dispatch(fetchFileVersions(fileId));
	const listFileMetadata = (fileId: string | undefined) => dispatch(fetchFileMetadata(fileId));
	const dismissError = () => dispatch(resetFailedReason());
	const createFileMetadata = (fileId: string | undefined, metadata: object) => dispatch(createFileMetadataAction(fileId, metadata));
	const updateFileMetadata = (fileId: string | undefined, metadata: object) => dispatch(patchFileMetadataAction(fileId, metadata));
	const deleteFileMetadata = (fileId: string | undefined, metadata: object) => dispatch(deleteFileMetadataAction(fileId, metadata));
	const downloadFile = (fileId: string | undefined, filename: string | undefined) => dispatch(fileDownloaded(fileId, filename))

	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);
	const filePreviews = useSelector((state: RootState) => state.file.previews);
	const fileVersions = useSelector((state: RootState) => state.file.fileVersions);
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [previews, setPreviews] = useState([]);
	const [enableAddMetadata, setEnableAddMetadata] = React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});

	// component did mount
	useEffect(() => {
		// load file information
		listFileSummary(fileId);
		listFileVersions(fileId);
		listDatasetAbout(datasetId); // get dataset name
	}, []);


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

	useEffect(() => {
		(async () => {
			if (filePreviews !== undefined && filePreviews.length > 0 && filePreviews[0].previews !== undefined) {
				const previewsTemp: any = [];
				await Promise.all(filePreviews[0].previews.map(async (filePreview) => {
					// download resources
					const Configuration: PreviewConfiguration = {
						previewType: "",
						url: "",
						fileid: "",
						previewer: "",
						fileType: "",
						resource: "",
					};
					Configuration.previewType = filePreview["p_id"].replace(" ", "-").toLowerCase();
					Configuration.url = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
					Configuration.fileid = filePreview["pv_id"];
					Configuration.previewer = `/public${filePreview["p_path"]}/`;
					Configuration.fileType = filePreview["pv_contenttype"];

					const resourceURL = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
					Configuration.resource = await downloadResource(resourceURL);

					previewsTemp.push(Configuration);

				}));
				setPreviews(previewsTemp);
			}
		})();
	}, [filePreviews]);

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

	// add folder path to breadcrumbs
	const folderPath = useSelector((state: RootState) => state.dataset.folderPath);
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
					<Button variant="contained"
							onClick={() => {
								downloadFile(fileId, fileSummary.name);
							}} endIcon={<Download/>}>
						Download
					</Button>
				</Grid>
			</Grid>
			<Grid container>
				<Grid item xs={8}>
					<Typography variant="h4" paragraph>{fileSummary.name}</Typography>
					{Object.keys(fileSummary).length > 0 &&
						<Typography variant="subtitle2"
									paragraph>Uploaded {parseDate(fileSummary.created)} by {fileSummary.creator.first_name} {fileSummary.creator.last_name}</Typography>
					}
					<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="file tabs">
						{/*<Tab label="Previews" {...a11yProps(0)} />*/}
						<Tab label="Version History" {...a11yProps(0)} />
						<Tab label="Metadata" {...a11yProps(2)} disabled={false}/>
					</Tabs>
					{/*Preview Tab*/}
					{/*<TabPanel value={selectedTabIndex} index={0}>*/}
					{/*	{*/}
					{/*		previews.map((preview) => {*/}
					{/*			if (preview["previewType"] === "audio") {*/}
					{/*				return <Audio fileId={preview["fileid"]} audioSrc={preview["resource"]}/>;*/}
					{/*			} else if (preview["previewType"] === "video") {*/}
					{/*				return <Video fileId={preview["fileid"]} videoSrc={preview["resource"]}/>;*/}
					{/*			} else if (preview["previewType"] === "thumbnail") {*/}
					{/*				return (<Thumbnail fileId={preview["fileid"]} fileType={preview["fileType"]}*/}
					{/*								   imgSrc={preview["resource"]}/>);*/}
					{/*			}*/}
					{/*		})*/}
					{/*	}*/}
					{/*</TabPanel>*/}
					{/*Version History*/}
					<TabPanel value={selectedTabIndex} index={0}>
						{fileVersions !== undefined ?
							<FileVersionHistory fileVersions={fileVersions}/> : <></>}
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
									<EditMetadata resourceType="file" resourceId={fileId}
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
									<DisplayMetadata updateMetadata={updateFileMetadata}
													 deleteMetadata={deleteFileMetadata}
													 resourceType="file" resourceId={fileId}/>
								</>
						}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4}>
						Extractions
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={5}>
						Comments
					</TabPanel>
				</Grid>
				<Grid item xs={4}>
					{Object.keys(fileSummary).length > 0 &&
						<div>
							{/*<FileAbout fileSummary={fileSummary}/>*/}
							<FileDetail fileSummary={fileSummary}/>
							{/*<FileStats fileSummary={fileSummary}/>*/}
						</div>
					}
				</Grid>
			</Grid>
		</Layout>
	);
};
