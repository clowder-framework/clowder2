import React, {useEffect, useState} from "react";
import config from "../app.config";
import {AppBar, Box, Divider, Grid, Tab, Tabs, Typography} from "@mui/material";
import {ClowderInput} from "./styledComponents/ClowderInput";
import {ClowderButton} from "./styledComponents/ClowderButton";
import Audio from "./previewers/Audio";
import Video from "./previewers/Video";
import {downloadResource} from "../utils/common";
import Thumbnail from "./previewers/Thumbnail";
import {PreviewConfiguration, RootState} from "../types/data";
import {useParams, useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {resetFailedReason, resetLogout} from "../actions/common"

import {TabPanel} from "./childComponents/TabComponent";
import {a11yProps} from "./childComponents/TabComponent";
import {fetchFileMetadata} from "../actions/file";
import TopBar from "./childComponents/TopBar";
import {MainBreadcrumbs} from "./childComponents/BreadCrumb";
import {ActionModal} from "./childComponents/ActionModal";

const tab = {
	fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		color: "#495057",
		textTransform: "capitalize",
}

export const File = (): JSX.Element => {
	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// path parameter
	const { fileId } = useParams<{fileId?: string}>();

	// query paramter get dataset id
	const search = useLocation().search;
	const datasetId = new URLSearchParams(search).get("dataset");
	const datasetName = new URLSearchParams(search).get("name");

	const dispatch = useDispatch();
	// const listFileMetadataJsonld = (fileId:string|undefined) => dispatch(fetchFileMetadataJsonld(fileId));
	// const listFilePreviews = (fileId:string|undefined) => dispatch(fetchFilePreviews(fileId));
	const listFileMetadata = (fileId:string|undefined) => dispatch(fetchFileMetadata(fileId));
	const dismissError = () => dispatch(resetFailedReason());
	const dismissLogout = () => dispatch(resetLogout());

	const fileMetadata = useSelector((state:RootState) => state.file.fileMetadata);
	const fileMetadataJsonld = useSelector((state:RootState) => state.file.metadataJsonld);
	const filePreviews = useSelector((state:RootState) => state.file.previews);
	const reason = useSelector((state:RootState) => state.error.reason);
	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [previews, setPreviews] = useState([]);

	// component did mount
	useEffect(() => {
		// load file information
		// listFileMetadataJsonld(fileId);
		// listFilePreviews(fileId);
		listFileMetadata(fileId);
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

	// log user out if token expired/unauthorized
	useEffect(() => {
		if (loggedOut) {
			// reset loggedOut flag so it doesn't stuck in "true" state, then redirect to login page
			dismissLogout();
			history("/login");
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
		},
		{
			"name":fileMetadata["name"],
			"url":`/files/${fileId}`
		}
	];
	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<MainBreadcrumbs paths={paths}/>
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={() => console.log(reason)}
							 handleActionCancel={handleErrorCancel}/>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item lg={8} sm={8} xl={8} xs={12}>
							<AppBar position="static" sx={{
								background: "#FFFFFF",
								boxShadow: "none",
							}}>
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="file tabs">
									<Tab sx={tab} label="Previews" {...a11yProps(0)} />
									<Tab sx={tab} label="Sections" {...a11yProps(1)} disabled={true}/>
									<Tab sx={tab} label="Metadata" {...a11yProps(2)} disabled={true}/>
									<Tab sx={tab} label="Extractions" {...a11yProps(3)} disabled={true}/>
									<Tab sx={tab} label="Comments" {...a11yProps(4)} disabled={true}/>
								</Tabs>
							</AppBar>
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
							<TabPanel value={selectedTabIndex} index={1}>
									NA
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={2}>
								{
									fileMetadataJsonld !== undefined && fileMetadataJsonld.length > 0 ?
										fileMetadataJsonld.map((item) => {
											return Object.keys(item["content"]).map((key) => {
												return <p>{key} - {JSON.stringify(item["content"][key])}</p>;
											}
											);
										}) : <></>
								}
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={3}>
									Extractions
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={4}>
									Comments
							</TabPanel>
						</Grid>
						<Grid item lg={4} sm={4} xl={4} xs={12}>
							{
								fileMetadata !== undefined ?
									<Box className="infoCard">
										<Typography className="title">About</Typography>
										<Typography
											className="content">File ID: {fileMetadata["id"]}</Typography>
										<Typography
											className="content">Type: {fileMetadata["content-type"]}</Typography>
										<Typography className="content">File
												size: {fileMetadata["size"]}</Typography>
										<Typography className="content">Uploaded
												on: {fileMetadata["date-created"]}</Typography>
										<Typography className="content">Uploaded
												as: {fileMetadata["name"]}</Typography>
										<Typography className="content">Uploaded
												by: {fileMetadata["creator"]}</Typography>
										<Typography
											className="content">Status: {fileMetadata["status"]}</Typography>
									</Box> : <></>
							}
							<Divider light/>
							<Box className="infoCard">
								<Typography className="title">Statistics</Typography>
								<Typography className="content">Views: {fileMetadata["views"]}</Typography>
								{/*<Typography className="content">Last viewed: Jun 07, 2021 21:49:09</Typography>*/}
								<Typography className="content">Downloads: {fileMetadata["downloads"]}</Typography>
								{/*<Typography className="content">Last downloaded: Never</Typography>*/}
							</Box>
							<Divider light/>
							<Box className="infoCard">
								<Typography className="title">Tags</Typography>
								<Grid container spacing={4}>
									<Grid item lg={8} sm={8} xl={8} xs={12}>
										<ClowderInput defaultValue="Tag"/>
									</Grid>
									<Grid item lg={4} sm={4} xl={4} xs={12}>
										<ClowderButton disabled={true}>Search</ClowderButton>
									</Grid>
								</Grid>
							</Box>
							<Divider light/>
						</Grid>
					</Grid>
				</div>
			</div>
		</div>
	);
};
