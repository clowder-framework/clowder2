import React, {useEffect, useState} from "react";
import config from "../../app.config";
import {Box, Button, Divider, Grid, IconButton, Menu, MenuItem, Tab, Tabs} from "@mui/material";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import {downloadResource} from "../../utils/common";
import Thumbnail from "../previewers/Thumbnail";
import {PreviewConfiguration, RootState} from "../../types/data";
import {useLocation, useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {resetFailedReason} from "../../actions/common"

import {a11yProps, TabPanel} from "../tabs/TabComponent";
import {fetchFileSummary, fetchFileVersions} from "../../actions/file";
import {MainBreadcrumbs} from "../navigation/BreadCrumb";
import {ActionModal} from "../dialog/ActionModal";
import {FileAbout} from "./FileAbout";
import {FileStats} from "./FileStats";
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
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const tab = {
	fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		textTransform: "capitalize",
}

const optionMenuItem = {
	fontWeight: "normal",
	fontSize: "14px",
	marginTop: "8px",
}

export const File = (): JSX.Element => {

	// path parameter
	const { fileId } = useParams<{fileId?: string}>();

	// query parameter get dataset id
	const search = useLocation().search;
	const datasetId = new URLSearchParams(search).get("dataset");
	const listDatasetAbout= (datasetId:string|undefined) => dispatch(fetchDatasetAbout(datasetId));
	const about = useSelector((state: RootState) => state.dataset.about);

	const dispatch = useDispatch();
	const listFileSummary = (fileId:string|undefined) => dispatch(fetchFileSummary(fileId));
	const listFileVersions = (fileId:string|undefined) => dispatch(fetchFileVersions(fileId));
	const listFileMetadata = (fileId: string | undefined) => dispatch(fetchFileMetadata(fileId));
	const dismissError = () => dispatch(resetFailedReason());
	const createFileMetadata = (fileId: string | undefined, metadata:object) => dispatch(createFileMetadataAction(fileId, metadata));
	const updateFileMetadata = (fileId: string | undefined, metadata:object) => dispatch(patchFileMetadataAction(fileId,metadata));
	const deleteFileMetadata = (fileId: string | undefined, metadata:object) => dispatch(deleteFileMetadataAction(fileId, metadata));
	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const fileSummary = useSelector((state:RootState) => state.file.fileSummary);
	const filePreviews = useSelector((state:RootState) => state.file.previews);
	const fileVersions = useSelector((state:RootState) => state.file.fileVersions);
	const reason = useSelector((state:RootState) => state.error.reason);
	const stack = useSelector((state:RootState) => state.error.stack);

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

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		console.log('options');
		setAnchorEl(null);
	};

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
			"name":about["name"],
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
		<Layout>
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
											<Grid container spacing={2} sx={{ "alignItems": "center"}}>
												<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
													<ClowderButton onClick={()=>{setEnableAddMetadata(true);}}>
														Add/Edit Metadata
													</ClowderButton>
												</Grid>
											</Grid>
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
							{/*option menus*/}
						</Grid>
						<Box className="infoCard">
							<Button aria-haspopup="true" onClick={handleOptionClick}
										sx={{
											padding: "6px 12px",
											width: "100px",
											background: "#6C757D",
											borderRadius: "4px",
											color: "white",
											textTransform: "capitalize",
											'&:hover': {
												color: "black"
											},
										}} endIcon={<ArrowDropDownIcon/>}>
									Options
								</Button>
								<Menu
										id="simple-menu"
										anchorEl={anchorEl}
										keepMounted
										open={Boolean(anchorEl)}
										onClose={handleOptionClose}
									>
									<MenuItem sx={optionMenuItem}
											  onClick={() => {
												  console.log("We will now to to extractions")
												  handleOptionClose();
											  }}>
										Extractions
									</MenuItem>
								</Menu>
						</Box>
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
		</Layout>
	);
};
