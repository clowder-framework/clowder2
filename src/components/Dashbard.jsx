import React, {useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {AppBar, Box, Link, Dialog, DialogTitle, Grid, ListItem, Tab, Tabs, Typography, Button} from "@material-ui/core";
import BusinessCenterIcon from "@material-ui/icons/BusinessCenter";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import CloudDownloadOutlinedIcon from "@material-ui/icons/CloudDownloadOutlined";

import CreateDataset from "./childComponents/CreateDataset";
import {downloadDataset} from "../utils/dataset";

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
	},
	fileCardOuterBox: {
		position: "relative"
	},
	fileCard: {
		background: "#FFFFFF",
		border: "1px solid #DFDFDF",
		boxSizing: "border-box",
		borderRadius: "4px",
		margin: "20px auto",
		"& > .MuiGrid-item": {
			padding: 0,
			height: "150px",
		},
	},
	fileCardImg: {
		height: "50%",
		margin: "40px auto",
		display: "block"
	},
	fileCardText: {
		padding: "40px 20px",
		fontSize: "16px",
		fontWeight: "normal",
		color: "#212529"
	},
	fileCardActionBox: {
		position: "absolute",
		right: "5%",
		top: "40px",
	},
	fileCardActionItem: {
		display: "block"
	}
}));

export default function Dashboard(props) {
	const classes = useStyles();

	const {datasets, selectDataset, deleteDataset, thumbnails, previous, next, datasetSchema, ...other} = props;

	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [open, setOpen] = React.useState(false);

	const handleTabChange = (event, newTabIndex) => {
		setSelectedTabIndex(newTabIndex);
	};

	return (
		<div className="inner-container">
			<Grid container spacing={4}>
				<Grid item lg={8} xl={8} md={8} sm={8} xs={12}>
					<AppBar className={classes.appBar} position="static">
						<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dashboard tabs">
							<Tab className={classes.tab} label="Datasets" {...a11yProps(0)} />
							<Tab className={classes.tab} label="Activity" {...a11yProps(1)} />
							<Tab className={classes.tab} label="Collections" {...a11yProps(2)} />
							<Tab className={classes.tab} label="Spaces" {...a11yProps(3)} />
							<Tab className={classes.tab} label="API Keys" {...a11yProps(4)} />
						</Tabs>
					</AppBar>
					<TabPanel value={selectedTabIndex} index={0}>

						{
							datasets !== undefined && thumbnails !== undefined ?
								datasets.map((dataset) => {
									let thumbnailComp = <BusinessCenterIcon className={classes.fileCardImg}
																			style={{fontSize: "5em"}}/>;
									thumbnails.map((thumbnail) => {
										if (dataset["id"] !== undefined && thumbnail["id"] !== undefined &&
											thumbnail["thumbnail"] !== null && thumbnail["thumbnail"] !== undefined &&
											dataset["id"] === thumbnail["id"]) {
											thumbnailComp = <img src={thumbnail["thumbnail"]} alt="thumbnail"
																 className={classes.fileCardImg}/>;
										}
									});
									return (
										<Box className={classes.fileCardOuterBox}>
											<ListItem button className={classes.fileCard} key={dataset["id"]}
													  onClick={() => selectDataset(dataset["id"])}>
												<Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
													{thumbnailComp}
												</Grid>
												<Grid item xl={8} lg={8} md={8} sm={8} xs={12}>
													<Box className={classes.fileCardText}>
														<Typography>Dataset name: {dataset["name"]}</Typography>
														<Typography>Description: {dataset["description"]}</Typography>
														<Typography>Created on: {dataset["created"]}</Typography>
													</Box>
												</Grid>
											</ListItem>
											<Box className={classes.fileCardActionBox}>
												<Box className={classes.fileCardActionItem}>
													<Button startIcon={<DeleteOutlineIcon/>}
															onClick={() => {deleteDataset(dataset["id"]);}}>
														Delete</Button>
												</Box>
												<Box className={classes.fileCardActionItem}>
													<Button startIcon={<StarBorderIcon/>}>Follow</Button>
												</Box>
												<Box className={classes.fileCardActionItem}>
													<Button startIcon={<CloudDownloadOutlinedIcon/>}
															onClick={() => {downloadDataset(dataset["id"], dataset["name"]);}}>
														Download</Button>
												</Box>
											</Box>
										</Box>
									);
								})
							:
							<></>
							}
							<Button onClick={previous}>Prev</Button>
							<Button onClick={next}>Next</Button>
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={1}></TabPanel>
							<TabPanel value={selectedTabIndex} index={2}></TabPanel>
							<TabPanel value={selectedTabIndex} index={3}></TabPanel>
							<TabPanel value={selectedTabIndex} index={4}></TabPanel>
							</Grid>
							<Grid item lg={4} md={4} xl={4} sm={4} xs={12}>
							<Box className="actionCard">
							<Typography className="title">Create your dataset</Typography>
							<Typography className="content">Some quick example text to tell users why they should upload
							their own data</Typography>
							<Link className="link" onClick={()=>{setOpen(true);}}>Create Dataset</Link>
							</Box>
							<Box className="actionCard">
							<Typography className="title">Explore more dataset</Typography>
							<Typography className="content">Some quick example text to tell users why they should follow
							more people</Typography>
							<Link href="" className="link">Go to Explore</Link>
							</Box>
							<Box className="actionCard">
							<Typography className="title">Want to learn more about Clowder?</Typography>
							<Typography className="content">Some quick example text to tell users why they should read
							the tutorial</Typography>
							<Link href="" className="link">Show me Tutorial</Link>
							</Box>
							</Grid>
							</Grid>
							<Dialog open={open} onClose={()=>{setOpen(false);}} fullWidth={true} aria-labelledby="create-dataset">
							<DialogTitle id="form-dialog-title">Create New Dataset</DialogTitle>
						{/*pass select to uploader so once upload succeeded, can jump to that dataset/file page*/}
							<CreateDataset selectDataset={selectDataset} setOpen={setOpen}/>
							</Dialog>
							</div>
							);
						}

						function TabPanel(props) {
						const {children, value, index, ...other} = props;

						return (
						<div
						role="tabpanel"
						hidden={value !== index}
						id={`dashboard-tabpanel-${index}`}
						aria-labelledby={`dashboard-tab-${index}`}
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
						id: `dashboard-tab-${index}`,
						"aria-controls": `dashboard-tabpanel-${index}`,
					};
					}
