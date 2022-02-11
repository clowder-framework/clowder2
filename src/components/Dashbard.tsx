import React, {useEffect, useState} from "react";
import {Box, Button, Dialog, DialogTitle, Grid, Link, Tab, Tabs, Typography} from "@mui/material";

import {CreateDataset} from "./childComponents/CreateDataset";

import {Dataset, Dataset as DatasetType, RootState} from "../types/data";
import {useDispatch, useSelector} from "react-redux";
import {datasetDeleted, fetchDatasets,} from "../actions/dataset";
import {resetFailedReason, resetLogout} from "../actions/common";
import {downloadThumbnail} from "../utils/thumbnail";
import TopBar from "./childComponents/TopBar";

import {a11yProps, TabPanel} from "./childComponents/TabComponent";
import {useNavigate} from "react-router-dom";
import {MainBreadcrumbs} from "./childComponents/BreadCrumb";
import {ActionModal} from "./childComponents/ActionModal";
import DatasetCard from "./childComponents/DatasetCard";

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
	const dismissLogout = () => dispatch(resetLogout());
	const datasets = useSelector((state: RootState) => state.dataset.datasets);
	const reason = useSelector((state: RootState) => state.error.reason);
	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);

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

	// log user out if token expired/unauthorized
	useEffect(() => {
		if (loggedOut) {
			// reset loggedOut flag so it doesn't stuck in "true" state, then redirect to login page
			dismissLogout();
			history("/login");
		}
	}, [loggedOut]);

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

	const handlePaginationChange = (event: any, value: number) => {
		console.log("Paginating to page " + value);
		// TODO implement
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
						<Grid item xs={8}>
							<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dashboard tabs">
									<Tab sx={tab} label="Datasets" {...a11yProps(0)} />
									<Tab sx={tab} label="Activity" {...a11yProps(1)} disabled={true}/>
									<Tab sx={tab} label="Collections" {...a11yProps(2)} disabled={true}/>
									<Tab sx={tab} label="Spaces" {...a11yProps(3)} disabled={true}/>
									<Tab sx={tab} label="API Keys" {...a11yProps(4)} disabled={true}/>
								</Tabs>
							</Box>
							<TabPanel value={selectedTabIndex} index={0}>
								<Grid container spacing={2}>
								{
									datasets !== undefined && datasetThumbnailList !== undefined ?
										datasets.map((dataset) => {
											return (
												<Grid item xs>
												<DatasetCard id={dataset.id} name={dataset.name} author={dataset.author}
															 created={dataset.created} description={dataset.description}/>
												</Grid>
											);
										})
										:
										<></>
								}
								</Grid>
								{/*<Box p={2}><Pagination count={10} onChange={handlePaginationChange}  /></Box>*/}
								<Button onClick={previous}>Prev</Button>
								<Button onClick={next}>Next</Button>
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={1} />
							<TabPanel value={selectedTabIndex} index={2} />
							<TabPanel value={selectedTabIndex} index={3} />
							<TabPanel value={selectedTabIndex} index={4} />
						</Grid>
						<Grid item xs={4}>
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
