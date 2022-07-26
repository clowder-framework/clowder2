import React, {useEffect, useState} from "react";
import config from "../../app.config";
import {Box, Button, Divider, FormControlLabel, Grid, IconButton, Switch, Tab, Tabs} from "@mui/material";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import {downloadResource} from "../../utils/common";
import Thumbnail from "../previewers/Thumbnail";
import {PreviewConfiguration, RootState} from "../../types/data";
import {useParams, useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {resetFailedReason, resetLogout} from "../../actions/common"

import {TabPanel} from "../tabs/TabComponent";
import {a11yProps} from "../tabs/TabComponent";
import {fetchFileSummary, fetchFileVersions} from "../../actions/file";
import TopBar from "../navigation/TopBar";
import {MainBreadcrumbs} from "../navigation/BreadCrumb";
import {ActionModal} from "../dialog/ActionModal";
import {FileAbout} from "./FileAbout";
import {FileStats} from "./FileStats";
import {FileVersionHistory} from "../versions/FileVersionHistory";
import {DisplayMetadata} from "../metadata/DisplayMetadata";
import {deleteFileMetadata as deleteFileMetadataAction, fetchFileMetadata} from "../../actions/metadata";
import {patchFileMetadata as patchFileMetadataAction} from "../../actions/metadata";
import {postFileMetadata as createFileMetadataAction} from "../../actions/metadata";
import {EditMetadata} from "../metadata/EditMetadata";
import {ClowderButton} from "../styledComponents/ClowderButton";
import CloseIcon from "@mui/icons-material/Close";
import file from "../../reducers/file";

const tab = {
	fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		textTransform: "capitalize",
}

export const File = (): JSX.Element => {
	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// path parameter
	const { fileId } = useParams<{fileId?: string}>();

	// query parameter get dataset id
	const search = useLocation().search;
	const datasetId = new URLSearchParams(search).get("dataset");
	const datasetName = new URLSearchParams(search).get("name");

	const dispatch = useDispatch();
	const listFileSummary = (fileId:string|undefined) => dispatch(fetchFileSummary(fileId));
	const listFileVersions = (fileId:string|undefined) => dispatch(fetchFileVersions(fileId));
	const listFileMetadata = (fileId: string | undefined) => dispatch(fetchFileMetadata(fileId));
	const dismissError = () => dispatch(resetFailedReason());
	const dismissLogout = () => dispatch(resetLogout());
	const createFileMetadata = (fileId: string | undefined, metadata:object) => dispatch(createFileMetadataAction(fileId, metadata));
	const updateFileMetadata = (fileId: string | undefined, metadata:object) => dispatch(patchFileMetadataAction(fileId,metadata));
	const deleteFileMetadata = (fileId: string | undefined, metadata:object) => dispatch(deleteFileMetadataAction(fileId, metadata));

	const fileSummary = useSelector((state:RootState) => state.file.fileSummary);
	const filePreviews = useSelector((state:RootState) => state.file.previews);
	const fileVersions = useSelector((state:RootState) => state.file.fileVersions);
	const reason = useSelector((state:RootState) => state.error.reason);
	const stack = useSelector((state:RootState) => state.error.stack);
	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [previews, setPreviews] = useState([]);
	const [enableAddMetadata, setEnableAddMetadata] = React.useState<boolean>(false);
	const [metadataRequestForms, setMetadataRequestForms] = useState({});

	// component did mount
	useEffect(() => {
		// load file information
		listFileSummary(fileId);
		listFileVersions(fileId);
	}, []);


	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined){
			setErrorOpen(true);
		}
	}, [reason])
	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	}
	const handleErrorReport = (reason:string) => {
		window.open(`${config.GHIssueBaseURL}+${reason}&body=${encodeURIComponent(stack)}`);
	}

	// log user out if token expired/unauthorized
	useEffect(() => {
		if (loggedOut) {
			// reset loggedOut flag so it doesn't stuck in "true" state, then redirect to login page
			dismissLogout();
			history("/auth/login");
		}
	}, [loggedOut]);

	useEffect(() => {
		(async () => {
			if (filePreviews !== undefined && filePreviews.length > 0 && filePreviews[0].previews !== undefined) {
				const previewsTemp:any = [];
				await Promise.all(filePreviews[0].previews.map(async (filePreview) => {
					// download resources
					const Configuration:PreviewConfiguration = {
						previewType:"",
						url:"",
						fileid:"",
						previewer:"",
						fileType:"",
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

	const handleTabChange = (_event:React.ChangeEvent<{}>, newTabIndex:number) => {
		setSelectedTabIndex(newTabIndex);
	};

	const setMetadata = (metadata:any) =>{
		// TODO wrap this in to a function
		setMetadataRequestForms(prevState => {
			// merge the contents field; e.g. lat lon
			if (metadata.definition in prevState){
				const prevContent = prevState[metadata.definition].contents;
				metadata.contents = {...prevContent, ...metadata.contents};
			}
			return ({...prevState, [metadata.definition]: metadata});
		});
	};

	const handleMetadataUpdateFinish = () =>{
		Object.keys(metadataRequestForms).map(key => {
			if ("id" in metadataRequestForms[key] && metadataRequestForms[key]["id"] !== undefined
				&& metadataRequestForms[key]["id"] !== null
				&& metadataRequestForms[key]["id"] !== "" )
			{
				// update existing metadata
				updateFileMetadata(fileId, metadataRequestForms[key]);
			}
			else{
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
			"name":datasetName,
			"url":`/datasets/${datasetId}`
		}
	];

	// add folder path to breadcrumbs
	const folderPath = useSelector((state:RootState) => state.dataset.folderPath);
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

	// add file link to breadcrumbs
	paths.push({
		"name":fileSummary["name"],
		"url":`/files/${fileId}`
	})


	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<MainBreadcrumbs paths={paths}/>
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				<div className="inner-container">
					<Grid container spacing={8}>
						<Grid item xs={8}>
							<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="file tabs">
									<Tab sx={tab} label="Previews" {...a11yProps(0)} />
									<Tab sx={tab} label="Version History" {...a11yProps(1)} />
									<Tab sx={tab} label="Metadata" {...a11yProps(3)} disabled={false}/>
								</Tabs>
							</Box>
							{/*Preview Tab*/}
							<TabPanel value={selectedTabIndex} index={0}>
								{
									previews.map((preview) =>{
										if (preview["previewType"] === "audio"){
											return <Audio fileId={preview["fileid"]} audioSrc={preview["resource"]} />;
										}
										else if (preview["previewType"] === "video"){
											return <Video fileId={preview["fileid"]} videoSrc={preview["resource"]} />;
										}
										else if (preview["previewType"] === "thumbnail"){
											return (<Thumbnail fileId={preview["fileid"]} fileType={preview["fileType"]}
																  imgSrc={preview["resource"]} />);
										}
									})
								}
							</TabPanel>
							{/*Version History*/}
							<TabPanel value={selectedTabIndex} index={1}>
								{ fileVersions !== undefined ?
									<FileVersionHistory fileVersions={fileVersions}/> : <></> }
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={2}>
								{
									enableAddMetadata ?
										<>
											<IconButton color="primary" aria-label="close"
														onClick={()=>{setEnableAddMetadata(false);}}
														sx={{float:"right"}}
											>
												<CloseIcon />
											</IconButton>
											<EditMetadata resourceType="file" resourceId={fileId}
														  setMetadata={setMetadata}
											/>
											<Button variant="contained" onClick={handleMetadataUpdateFinish} sx={{ mt: 1, mr: 1 }}>
												Update
											</Button>
											<Button onClick={()=>{setEnableAddMetadata(false);}}
													sx={{ mt: 1, mr: 1 }}>
												Cancel
											</Button>
										</>
										:
										<>
											<ClowderButton onClick={()=>{setEnableAddMetadata(true);}}>
												Add/Edit Metadata
											</ClowderButton>
											<DisplayMetadata updateMetadata={updateFileMetadata}
															 deleteMetadata={deleteFileMetadata}
															 resourceType="file" resourceId={fileId} />
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
									<FileAbout fileSummary={fileSummary}/>
									<Divider light/>
									<FileStats fileSummary={fileSummary} />
									<Divider light/>
								</div>
							}
						</Grid>
					</Grid>
				</div>
			</div>
		</div>
	);
};
