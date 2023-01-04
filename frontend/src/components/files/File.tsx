import React, {useEffect, useState} from "react";
import config from "../../app.config";
import {Button, Grid, Tab, Tabs, Typography} from "@mui/material";
import {downloadResource, parseDate} from "../../utils/common";
import {PreviewConfiguration, RootState} from "../../types/data";
import {useParams, useSearchParams, useNavigate} from "react-router-dom";
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
import Layout from "../Layout";
import {fetchDatasetAbout} from "../../actions/dataset";
import {Download} from "@mui/icons-material";
import {FileDetails} from "./FileDetails";
import {fetchFolderPath} from "../../actions/folder";
import {Listeners} from "../listeners/Listeners";


export const File = (): JSX.Element => {

	const history = useNavigate();
	// path parameter
	const {fileId} = useParams<{ fileId?: string }>();

	// search parameters
	let [searchParams] = useSearchParams();
	const folderId = searchParams.get("folder");
	const datasetId = searchParams.get("dataset");

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
	const getFolderPath = (folderId: string | null) => dispatch(fetchFolderPath(folderId));

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
		// FIXME replace checks for null with logic to load this info from redux instead of the page parameters
		if (datasetId != "null" && datasetId != "undefined") {
			listDatasetAbout(datasetId); // get dataset name
		}
		if (folderId != "null" && folderId != "undefined") {
			getFolderPath(folderId); // get folder path
		}
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

	// const submitToListener = ()=> {
	// 	const filename = fileSummary['name']
	// 	console.log('submit to listener');
	// 	console.log("the file name is", filename);
	// 	console.log('the file id is', fileId);
	// 	history(`/listeners?fileId=${fileId}&fileName=${filename}`);
	// }

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
	const folderPath = useSelector((state: RootState) => state.folder.folderPath);
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
				<Grid item xs={10} sx={{display: 'flex', alignItems: 'center'}}>
					<MainBreadcrumbs paths={paths}/>
				</Grid>
				<Grid item xs={2}>
					<Button variant="contained"
							onClick={() => {
								downloadFile(fileId, fileSummary.name);
							}} endIcon={<Download/>}>
						Download
					</Button>
				</Grid>
			</Grid>
			<Grid container>
				<Grid item xs={10}>
					<Typography variant="h4" paragraph>{fileSummary.name}</Typography>
					{Object.keys(fileSummary).length > 0 &&
						<Typography variant="subtitle2"
									paragraph>Uploaded {parseDate(fileSummary.created)} by {fileSummary.creator.first_name} {fileSummary.creator.last_name}</Typography>
					}
					<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="file tabs">
						{/*<Tab label="Previews" {...a11yProps(0)} />*/}
						<Tab label="Version History" {...a11yProps(0)} />
						<Tab label="Metadata" {...a11yProps(1)} disabled={false}/>
						<Tab label="Extractors" {...a11yProps(2)} disabled={false}/>
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
									<DisplayMetadata updateMetadata={updateFileMetadata}
													 deleteMetadata={deleteFileMetadata}
													 resourceType="file" resourceId={fileId}/>
									<Button variant="contained" onClick={() => {
										setEnableAddMetadata(true);
									}}>
										Add Metadata
									</Button>
								</>
						}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={2}>
						<Listeners />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={3}>
						Comments
					</TabPanel>
				</Grid>
				<Grid item xs={2}>
					{Object.keys(fileSummary).length > 0 &&
						<FileDetails fileSummary={fileSummary}/>
					}
				</Grid>
			</Grid>
		</Layout>
	);
};
