import React, {useEffect, useState} from "react";
import config from "../../app.config";
import {Box, Divider, Grid, Tab, Tabs} from "@mui/material";
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
import {FileSearch} from "./FileSearch";
import {FileVersionHistory} from "../versions/FileVersionHistory";
import {DisplayMetadata} from "../metadata/DisplayMetadata";
import {deleteFileMetadata as deleteFileMetadataAction} from "../../actions/metadata";
import {patchFileMetadata as patchFileMetadataAction} from "../../actions/metadata";

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
	const dismissError = () => dispatch(resetFailedReason());
	const dismissLogout = () => dispatch(resetLogout());
	const updateFileMetadata = (fileId: string | undefined, content:object) => dispatch(patchFileMetadataAction(fileId,content));
	const deleteFileMetadata = (fileId: string | undefined, metadata:object) => dispatch(deleteFileMetadataAction(fileId, metadata));

	const fileSummary = useSelector((state:RootState) => state.file.fileSummary);
	const filePreviews = useSelector((state:RootState) => state.file.previews);
	const fileVersions = useSelector((state:RootState) => state.file.fileVersions);
	const reason = useSelector((state:RootState) => state.error.reason);
	const stack = useSelector((state:RootState) => state.error.stack);
	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [previews, setPreviews] = useState([]);

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
									<Tab sx={tab} label="Sections" {...a11yProps(2)} disabled={true}/>
									<Tab sx={tab} label="Extractions" {...a11yProps(4)} disabled={true}/>
									<Tab sx={tab} label="Comments" {...a11yProps(5)} disabled={true}/>
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
								<DisplayMetadata updateMetadata={updateFileMetadata}
												 deleteMetadata={deleteFileMetadata}
												 resourceType="file" resourceId={fileId} />
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
							<FileSearch />
							<Divider light/>
						</Grid>
					</Grid>
				</div>
			</div>
		</div>
	);
};
