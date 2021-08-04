import React, {useEffect, useState} from "react";
import config from "../app.config";
import TopBar from "./childComponents/TopBar";
import Breadcrumbs from "./childComponents/BreadCrumb";
import {AppBar, Box, Tab, Tabs, Typography, Grid, Divider} from "@material-ui/core"
import {makeStyles} from "@material-ui/core/styles";
import {ClowderInput} from "./styledComponents/ClowderInput";
import {ClowderButton} from "./styledComponents/ClowderButton";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar:{
		background: "#FFFFFF",
		boxShadow: "none",
	},
	tab:{
		fontStyle: "normal",
		fontWeight: "normal",
		fontSize: "16px",
		color: "#495057",
		textTransform:"capitalize",
	},
	infoCard:{
		padding: "48px 0",
	},
	title:{
		fontWeight: "600",
		fontSize: "16px",
		color: "#000000",
		marginBottom:"8px"
	},
	content:{
		fontSize: "14px",
		color: "#000000",
}
}));

export default function File(props) {
	const classes = useStyles();

	const {
		listFileMetadata, fileMetadata,
		listFileExtractedMetadata, fileExtractedMetadata,
		listFileMetadataJsonld, fileMetadataJsonld,
		listFilePreviews, filePreviews,
		...other
	} = props;

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);

	// component did mount
	useEffect(() => {
		// attach helper jquery
		const script = document.createElement("script");
		script.src = `../public/clowder/assets/javascripts/previewers/helper.js`;
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		}
	}, []);

	useEffect(() => {
		// remove last previewer script attached
		const previewerScripts = document.getElementsByClassName("previewer-script");
		while (previewerScripts.length > 0) {
			previewerScripts[0].parentNode.removeChild(previewerScripts[0]);
		}

		if (filePreviews.length > 0 && filePreviews[0].previews !== undefined) {
			let uniquePid = [];
			// look at which previewer to load
			filePreviews[0].previews.map((filePreview, index) => {

				// do not attach same previewer twice
				if (uniquePid.indexOf(filePreview["p_id"]) === -1) {
					uniquePid.push(filePreview["p_id"]);

					// attach previwer jquery
					const script = document.createElement("script");
					script.className = "previewer-script";
					script.src = `../public${filePreview["p_path"]}/${filePreview["p_main"]}`;
					script.async = true;
					document.body.appendChild(script);
					return () => {
						document.body.removeChild(script);
					}
				}
			});
		}
	}, [filePreviews])

	const selectFile = (fileId) => {
		listFileMetadata(fileId);
		listFileExtractedMetadata(fileId);
		listFileMetadataJsonld(fileId);
		listFilePreviews(fileId);
	}

	const handleTabChange = (event, newTabIndex) => {
		setSelectedTabIndex(newTabIndex);
	};

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<Breadcrumbs filename={fileMetadata["filename"]}/>

				{/*tabs*/}
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
									filePreviews.length > 0 && filePreviews[0].previews !== undefined
										?
										filePreviews[0].previews.map((filePreview, index) => {
											const Configuration = {};
											Configuration.tab = `#previewer_${filePreviews[0]["file_id"]}_${index}`;
											Configuration.url = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
											Configuration.fileid = filePreview["pv_id"];
											Configuration.previewer = `/public${filePreview["p_path"]}/`;
											Configuration.fileType = filePreview["pv_contenttype"];
											Configuration.APIKEY = config.apikey;
											Configuration.authenticated = true;
											// Configuration.metadataJsonld = fileMetadataJsonld;

											let previewId = filePreview["p_id"].replace(" ", "-").toLowerCase();
											return (<div className={`configuration ${previewId}`}
														 data-configuration={JSON.stringify(Configuration)}>
												<div id={Configuration.tab.slice(1)}></div>
											</div>);
										})
										:
										<></>
								}
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={1}>
								NA
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={2}>
								{
									fileMetadataJsonld.map((item) => {
										return Object.keys(item["content"]).map((key) => {
												return (<p>{key} - {JSON.stringify(item["content"][key])}</p>);
											}
										);
									})
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
							<Box className={classes.infoCard}>
								<Typography className={classes.title}>About</Typography>
								<Typography className={classes.content}>Type: {fileMetadata["content-type"]}</Typography>
								<Typography className={classes.content}>File size: {fileMetadata["size"]}</Typography>
								<Typography className={classes.content}>Uploaded on: {fileMetadata["date-created"]}</Typography>
								<Typography className={classes.content}>Uploaded as: {fileMetadata["filename"]}</Typography>
								<Typography className={classes.content}>Uploaded by: {fileMetadata["authorId"]}</Typography>
								<Typography className={classes.content}>Status: {fileMetadata["status"]}</Typography>
							</Box>
							<Divider light />
							<Box className={classes.infoCard}>
								<Typography className={classes.title}>Statistics</Typography>
								<Typography className={classes.content}>Views:10</Typography>
								<Typography className={classes.content}>Last viewed:Jun 07, 2021 21:49:09</Typography>
								<Typography className={classes.content}>Downloads:0</Typography>
								<Typography className={classes.content}>Last downloaded:Never</Typography>
							</Box>
							<Divider light />
							<Box className={classes.infoCard}>
								<Typography className={classes.title}>Tags</Typography>
								<Grid container spacing={}>
									<Grid item lg={8} sm={8} xl={8} xs={12}>
										<ClowderInput defaultValue="Tag"/>
									</Grid>
									<Grid item lg={4} sm={4} xl={4} xs={12}>
										<ClowderButton>Search</ClowderButton>
									</Grid>
								</Grid>
							</Box>
							<Divider light />
						</Grid>
					</Grid>

					<select name="files" id="files" onChange={(e) => { selectFile(e.target.value);}}
							defaultValue="select">
						<option value="select" disabled>Select A File</option>
						<option value="60ee082d5e0e3ff9d746b5fc">Text File</option>
						<option value="59933ae8e4b04cf488f47aba">PDF</option>
						<option value="5d974f435e0eb9edf7b3cf00">Audio</option>
						<option value="59933ae9e4b04cf488f47b48">Video</option>
						<option value="576b0b1ce4b0e899329e8553">Image</option>
						<option value="60ee08325e0e3ff9d746bc57">Three D</option>
					</select>
				</div>
			</div>


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
