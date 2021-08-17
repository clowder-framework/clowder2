import React, {useEffect, useState} from "react";
import config from "../app.config";
import {AppBar, Box, Divider, Grid, Tab, Tabs, Typography} from "@material-ui/core"
import {makeStyles} from "@material-ui/core/styles";
import {ClowderInput} from "./styledComponents/ClowderInput";
import {ClowderButton} from "./styledComponents/ClowderButton";
import Audio from "./previewers/Audio";
import Video from "./previewers/Video";
import {downloadResource} from "../utils/common";
import Thumbnail from "./previewers/Thumbnail";

const useStyles = makeStyles((theme) => ({
	appBar: {
		background: "#FFFFFF",
		boxShadow: "none",
	},
	tab: {
		fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		color: "#495057",
		textTransform: "capitalize",
	}
}));

export default function File(props) {
	const classes = useStyles();

	const {fileMetadata, fileExtractedMetadata, fileMetadataJsonld, filePreviews, fileId, ...other} = props;

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [previews, setPreviews] = useState([]);

	// // component did mount
	// useEffect(() => {
	// 	// attach helper jquery
	// 	const script = document.createElement("script");
	// 	script.src = `../public/clowder/assets/javascripts/previewers/helper.js`;
	// 	script.async = true;
	// 	document.body.appendChild(script);
	// 	return () => {
	// 		document.body.removeChild(script);
	// 	}
	// }, []);

	useEffect(() => {
		(async () => {
			if (filePreviews !== undefined && filePreviews.length > 0 && filePreviews[0].previews !== undefined) {
				let previewsTemp = [];
				await Promise.all(filePreviews[0].previews.map(async (filePreview) => {
					// download resources
					let Configuration = {};
					Configuration.previewType = filePreview["p_id"].replace(" ", "-").toLowerCase();
					Configuration.url = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
					Configuration.fileid = filePreview["pv_id"];
					Configuration.previewer = `/public${filePreview["p_path"]}/`;
					Configuration.fileType = filePreview["pv_contenttype"];

					let resourceURL = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
					Configuration.resource = await downloadResource(resourceURL);

					previewsTemp.push(Configuration);

				}));
				setPreviews(previewsTemp);
			}
		})();
	}, [filePreviews]);

	const handleTabChange = (event, newTabIndex) => {
		setSelectedTabIndex(newTabIndex);
	};

	return (
		<div className="inner-container">
				<Grid container spacing={4}>
					<Grid item lg={8} sm={8} xl={8} xs={12}>
						<AppBar className={classes.appBar} position="static">
							<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="file tabs">
								<Tab className={classes.tab} label="Previews" {...a11yProps(0)} />
								<Tab className={classes.tab} label="Sections" {...a11yProps(1)} />
								<Tab className={classes.tab} label="Metadata" {...a11yProps(2)} />
								<Tab className={classes.tab} label="Extractions" {...a11yProps(3)} />
								<Tab className={classes.tab} label="Comments" {...a11yProps(4)} />
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
										return <Thumbnail fileId={preview["fileid"]} fileType={preview["fileType"]}
														  imgSrc={preview["resource"]} />;
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
												return (<p>{key} - {JSON.stringify(item["content"][key])}</p>);
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
										className="content">Type: {fileMetadata["content-type"]}</Typography>
									<Typography className="content">File
										size: {fileMetadata["size"]}</Typography>
									<Typography className="content">Uploaded
										on: {fileMetadata["date-created"]}</Typography>
									<Typography className="content">Uploaded
										as: {fileMetadata["filename"]}</Typography>
									<Typography className="content">Uploaded
										by: {fileMetadata["authorId"]}</Typography>
									<Typography
										className="content">Status: {fileMetadata["status"]}</Typography>
								</Box> : <></>
						}
						<Divider light/>
						<Box className="infoCard">
							<Typography className="title">Statistics</Typography>
							<Typography className="content">Views: 10</Typography>
							<Typography className="content">Last viewed: Jun 07, 2021 21:49:09</Typography>
							<Typography className="content">Downloads: 0</Typography>
							<Typography className="content">Last downloaded: Never</Typography>
						</Box>
						<Divider light/>
						<Box className="infoCard">
							<Typography className="title">Tags</Typography>
							<Grid container spacing={4}>
								<Grid item lg={8} sm={8} xl={8} xs={12}>
									<ClowderInput defaultValue="Tag"/>
								</Grid>
								<Grid item lg={4} sm={4} xl={4} xs={12}>
									<ClowderButton>Search</ClowderButton>
								</Grid>
							</Grid>
						</Box>
						<Divider light/>
					</Grid>
				</Grid>
			</div>
	);
}

function TabPanel(props) {
	const {children, value, index, ...other} = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`file-tabpanel-${index}`}
			aria-labelledby={`file-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box p={3}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function a11yProps(index) {
	return {
		id: `file-tab-${index}`,
		"aria-controls": `file-tabpanel-${index}`,
	};
}
