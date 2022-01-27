import React, {useEffect, useState} from "react";
import {AppBar, Box, Link, Dialog, DialogTitle, Grid, ListItem, Tab, Tabs, Typography, Button} from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";

import {CreateDataset} from "./childComponents/CreateDataset";
import {downloadDataset} from "../utils/dataset";

import {Dataset, Dataset as DatasetType, RootState, Thumbnail} from "../types/data";
import {useDispatch, useSelector} from "react-redux";
import {datasetDeleted, fetchDatasets, } from "../actions/dataset";
import {resetFailedReason} from "../actions/common";
import {downloadThumbnail} from "../utils/thumbnail";
import TopBar from "./childComponents/TopBar";

import {TabPanel} from "./childComponents/TabComponent";
import {a11yProps} from "./childComponents/TabComponent";
import {useNavigate} from "react-router-dom";
import {MainBreadcrumbs} from "./childComponents/BreadCrumb";
import {useHistory} from "react-router-dom";
import {ActionModal} from "./childComponents/ActionModal";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	color: "#495057",
	textTransform: "capitalize",
};

export const Dashboard = (): JSX.Element => {

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const deleteDataset = (datasetId: string) => dispatch(datasetDeleted(datasetId));
	const listDatasets = (when: string, date: string, limit: number) => dispatch(fetchDatasets(when, date, limit));
	const dismissError = () => dispatch(resetFailedReason());
	const datasets = useSelector((state: RootState) => state.dataset.datasets);
	const reason = useSelector((state: RootState) => state.dataset.reason);

	const [datasetThumbnailList, setDatasetThumbnailList] = useState<any>([]);
	const [limit,] = useState<number>(5);
	const [lastDataset, setLastDataset] = useState<DatasetType>();
	const [firstDataset, setFirstDataset] = useState<DatasetType>();
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [selectedDataset, setSelectedDataset] = useState<Dataset>();
	const [creationOpen, setCreationOpen] = useState(false);

	// confirmation dialog
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const deleteSelectedDataset = () => {
		if (selectedDataset) {
			deleteDataset(selectedDataset["id"]);
		}
		setConfirmationOpen(false);
	}

	// component did mount
	useEffect(() => {
		listDatasets("", "", limit);
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

	// fetch thumbnails from each individual dataset/id calls
	useEffect(() => {
		(async () => {
			if (datasets !== undefined && datasets.length > 0) {

				// TODO change the type any to something else
				const datasetThumbnailListTemp: any = [];
				await Promise.all(datasets.map(async (dataset) => {
					// add thumbnails
					if (dataset["thumbnail"] !== null && dataset["thumbnail"] !== undefined) {
						const thumbnailURL = await downloadThumbnail(dataset["thumbnail"]);
						datasetThumbnailListTemp.push({"id": dataset["id"], "thumbnail": thumbnailURL});
					}
				}));
				setDatasetThumbnailList(datasetThumbnailListTemp);

				// find last and first dataset for pagination
				setFirstDataset(datasets[0]);
				setLastDataset(datasets[datasets.length - 1]);

			}
		})();
	}, [datasets]);

	// switch tabs
	const handleTabChange = (_event: React.ChangeEvent<{}>, newTabIndex: number) => {
		setSelectedTabIndex(newTabIndex);
	};

	// pagination
	const previous = () => {
		const date = firstDataset ? new Date(firstDataset["created"]) : null;
		if (date) listDatasets("b", date.toISOString(), limit);
	};

	const next = () => {
		const date = lastDataset ? new Date(lastDataset["created"]) : null;
		if (date) listDatasets("a", date.toISOString(), limit);
	};

	const selectDataset = (selectedDatasetId: string) => {
		// Redirect to dataset route with dataset Id
		history(`/datasets/${selectedDatasetId}`);
	};

	// for breadcrumb
	const paths = [
		{
			"name": "Explore",
			"url": "/",
		}
	];

	return (
		<div>
			<TopBar/>
			<div className="outer-container">
				<MainBreadcrumbs paths={paths}/>
				{/*Confirmation dialogue*/}
				<ActionModal actionOpen={confirmationOpen} actionTitle="Are you sure?"
							 actionText="Do you really want to delete? This process cannot be undone."
							 actionBtnName="Delete" handleActionBtnClick={deleteSelectedDataset}
							 handleActionCancel={() => { setConfirmationOpen(false);}}/>
			    {/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={() => console.log(reason)}
							 handleActionCancel={handleErrorCancel}/>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item lg={8} xl={8} md={8} sm={8} xs={12}>
							<AppBar position="static" sx={{
								background: "#FFFFFF",
								boxShadow: "none",
							}}>
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dashboard tabs">
									<Tab sx={tab} label="Datasets" {...a11yProps(0)} />
									<Tab sx={tab} label="Activity" {...a11yProps(1)} disabled={true}/>
									<Tab sx={tab} label="Collections" {...a11yProps(2)} disabled={true}/>
									<Tab sx={tab} label="Spaces" {...a11yProps(3)} disabled={true}/>
									<Tab sx={tab} label="API Keys" {...a11yProps(4)} disabled={true}/>
								</Tabs>
							</AppBar>
							<TabPanel value={selectedTabIndex} index={0}>

								{
									datasets !== undefined && datasetThumbnailList !== undefined ?
										datasets.map((dataset) => {
											let thumbnailComp = (<BusinessCenterIcon sx={{
												height: "50%",
												margin: "40px auto",
												display: "block"
											}}
												style={{fontSize: "5em"}}/>);
											datasetThumbnailList.map((thumbnail: Thumbnail) => {
												if (dataset["id"] !== undefined && thumbnail["id"] !== undefined &&
													thumbnail["thumbnail"] !== null && thumbnail["thumbnail"] !== undefined &&
													dataset["id"] === thumbnail["id"]) {
													thumbnailComp = (
															<Box
																component="img"
																sx={{
																	height: "50%",
																	margin: "40px auto",
																	display: "block"
																}}
																src={thumbnail["thumbnail"]} alt="thumbnail"
															/>
													);
												}
											});
											return (
												<Box sx={{
													position: "relative"
												}} key={dataset["id"]}>
													<ListItem button sx={{
														background: "#FFFFFF",
														border: "1px solid #DFDFDF",
														boxSizing: "border-box",
														borderRadius: "4px",
														margin: "20px auto",
														"& > .MuiGrid-item": {
															padding: 0,
															height: "150px",
														},
													}} key={dataset["id"]}
															  onClick={() => selectDataset(dataset["id"])}>
														<Grid item xl={2} lg={2} md={2} sm={2} xs={12}>
															{thumbnailComp}
														</Grid>
														<Grid item xl={8} lg={8} md={8} sm={8} xs={12}>
															<Box sx={{
																padding: "40px 20px",
																fontSize: "16px",
																fontWeight: "normal",
																color: "#212529"
															}}>
																<Typography>Dataset name: {dataset["name"]}</Typography>
																<Typography>Description: {dataset["description"]}</Typography>
																<Typography>Created
																	on: {dataset["created"]}</Typography>
															</Box>
														</Grid>
													</ListItem>
													<Box sx={{
														position: "absolute",
														right: "5%",
														top: "40px",
													}}>
														<Box sx={{display: "block"}}>
															<Button startIcon={<DeleteOutlineIcon/>}
																onClick={() => {
																	setSelectedDataset(dataset);
																	setConfirmationOpen(true);}
																}>
																Delete</Button>
														</Box>
														<Box sx={{display: "block"}}>
															<Button startIcon={<StarBorderIcon/>} disabled={true}>Follow</Button>
														</Box>
														<Box sx={{display: "block"}}>
															<Button startIcon={<CloudDownloadOutlinedIcon/>}
																onClick={() => {
																	downloadDataset(dataset["id"], dataset["name"]);
																}} disabled={true}>
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
							<TabPanel value={selectedTabIndex} index={1} />
							<TabPanel value={selectedTabIndex} index={2} />
							<TabPanel value={selectedTabIndex} index={3} />
							<TabPanel value={selectedTabIndex} index={4} />
						</Grid>
						<Grid item lg={4} md={4} xl={4} sm={4} xs={12}>
							<Box className="actionCard">
								<Typography className="title">Create your dataset</Typography>
								<Typography className="content">Some quick example text to tell users why they should
									upload
									their own data</Typography>
								<Link href="#" className="link" onClick={() => {
									setCreationOpen(true);
								}}>Create Dataset</Link>
							</Box>
							<Box className="actionCard">
								<Typography className="title">Explore more dataset</Typography>
								<Typography className="content">Some quick example text to tell users why they should
									follow
									more people</Typography>
								<Link href="#" className="link">Go to Explore</Link>
							</Box>
							<Box className="actionCard">
								<Typography className="title">Want to learn more about Clowder?</Typography>
								<Typography className="content">Some quick example text to tell users why they should
									read
									the tutorial</Typography>
								<Link href="https://clowderframework.org/" className="link" target="_blank">Show me Tutorial</Link>
							</Box>
						</Grid>
					</Grid>
					<Dialog open={creationOpen} onClose={() => {
						setCreationOpen(false);
					}} fullWidth={true} aria-labelledby="create-dataset">
						<DialogTitle id="form-dialog-title">Create New Dataset</DialogTitle>
						{/*pass select to uploader so once upload succeeded, can jump to that dataset/file page*/}
						<CreateDataset setOpen={setCreationOpen}/>
					</Dialog>
				</div>
			</div>
		</div>
	);
};
