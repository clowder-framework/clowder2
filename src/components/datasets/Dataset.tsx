import React, {useEffect, useState} from "react";
import {Box, Button, Dialog, DialogTitle, Divider, Grid, Menu, MenuItem, Tab, Tabs, Typography, TextField} from "@mui/material";
import {ClowderInput} from "../styledComponents/ClowderInput";
import {ClowderButton} from "../styledComponents/ClowderButton";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {downloadDataset} from "../../utils/dataset";
import {useNavigate, useParams} from "react-router-dom";
import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {
	datasetDeleted,
	fetchDatasetAbout,
	fetchFilesInDataset, fetchFolderPath,
	fetchFoldersInDataset,
	folderAdded, updateDataset
} from "../../actions/dataset";
import {resetFailedReason, resetLogout} from "../../actions/common"

import {a11yProps, TabPanel} from "../tabs/TabComponent";
import TopBar from "../navigation/TopBar";
import {MainBreadcrumbs} from "../navigation/BreadCrumb";
import {UploadFile} from "../files/UploadFile";
import {ActionModal} from "../dialog/ActionModal";
import FilesTable from "../files/FilesTable";
import {CreateFolder} from "../folders/CreateFolder";
import { useSearchParams } from "react-router-dom";
import {parseDate} from "../../utils/common";
import config from "../../app.config";
import {DatasetIn} from "../../openapi/v2";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

const optionMenuItem = {
	fontWeight: "normal",
	fontSize: "14px",
	marginTop:"8px",
}

export const Dataset = (): JSX.Element => {

	// path parameter
	const { datasetId } = useParams<{datasetId?: string}>();

	// search parameters
	let [searchParams, setSearchParams] = useSearchParams();
	const folder = searchParams.get("folder");
	useEffect(() => {
		const currentParams = Object.fromEntries([...searchParams]);
		console.log(currentParams); // get new values onchange
	}, [searchParams]);

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const deleteDataset = (datasetId:string|undefined) => dispatch(datasetDeleted(datasetId));
	const editDataset = (datasetId: string|undefined, formData: DatasetIn) => dispatch(updateDataset(datasetId, formData));
	const addFolder = (datasetId:string|undefined, folderName:string, parentFolder:string|null) => dispatch(folderAdded(datasetId, folderName, parentFolder));
	const getFolderPath= (folderId:string|undefined) => dispatch(fetchFolderPath(folderId));
	const listFilesInDataset = (datasetId:string|undefined, folderId:string|undefined) => dispatch(fetchFilesInDataset(datasetId, folderId));
	const listFoldersInDataset = (datasetId:string|undefined, parentFolder:string|undefined) => dispatch(fetchFoldersInDataset(datasetId, parentFolder));
	const listDatasetAbout= (datasetId:string|undefined) => dispatch(fetchDatasetAbout(datasetId));
	const dismissError = () => dispatch(resetFailedReason());
	const dismissLogout = () => dispatch(resetLogout());

	// mapStateToProps
	const about = useSelector((state:RootState) => state.dataset.about);
	const reason = useSelector((state:RootState) => state.error.reason);
	const stack = useSelector((state:RootState) => state.error.stack);
	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);
	const folderPath = useSelector((state:RootState) => state.dataset.folderPath);

	// state
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [createFileOpen, setCreateFileOpen] = React.useState<boolean>(false);
	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
	const [editingNameOpen, setEditingNameOpen] = React.useState<boolean>(false);
	const [editDescriptionOpen, setEditDescriptionOpen] = React.useState<boolean>(false);
	const [datasetName, setDatasetName] = React.useState<string>("");
	const [datasetDescription, setDatasetDescription] = React.useState<string>("");

	// component did mount list all files in dataset
	useEffect(() => {
		listFilesInDataset(datasetId, folder);
		listFoldersInDataset(datasetId, folder);
		listDatasetAbout(datasetId);
		getFolderPath(folder);
	}, [searchParams]);

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
			history("/login");
		}
	}, [loggedOut]);

	// new folder dialog
	const [newFolder, setNewFolder] = React.useState<boolean>(false);
	const handleCloseNewFolder = () => {
		setNewFolder(false);
	}

	const handleTabChange = (_event:React.ChangeEvent<{}>, newTabIndex:number) => {
		setSelectedTabIndex(newTabIndex);
	};

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};

	const handleDatasetNameEdit = () => {
		editDataset(about["id"], {"name": datasetName});
		setEditingNameOpen(false);
	};

	const handleDatasetDescriptionEdit = () => {
		editDataset(about["id"], {"description": datasetDescription});
		setEditDescriptionOpen(false);
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
		<div>
			<TopBar/>
			<div className="outer-container">
				<MainBreadcrumbs paths={paths}/>
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item xs={8}>
							<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
								<Tabs value={selectedTabIndex} onChange={handleTabChange} aria-label="dataset tabs">
									<Tab sx={tab} label="Files" {...a11yProps(0)} />
									<Tab sx={tab} label="Metadata" {...a11yProps(1)} disabled={true}/>
									<Tab sx={tab} label="Extractions" {...a11yProps(2)} disabled={true}/>
									<Tab sx={tab} label="Visualizations" {...a11yProps(3)} disabled={true}/>
									<Tab sx={tab} label="Comments" {...a11yProps(4)} disabled={true}/>
								</Tabs>
							</Box>
							<TabPanel value={selectedTabIndex} index={0}>
								<FilesTable datasetId={datasetId} datasetName={about.name}/>
							</TabPanel>
							<TabPanel value={selectedTabIndex} index={1} />
							<TabPanel value={selectedTabIndex} index={2} />
							<TabPanel value={selectedTabIndex} index={3} />
							<TabPanel value={selectedTabIndex} index={4} />
						</Grid>
						<Grid item xs={4}>
							{/*option menus*/}
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
										}} endIcon={<ArrowDropDownIcon />}>
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
											  onClick={()=>{
												  setCreateFileOpen(true);
												  handleOptionClose();
											  }}>
										Upload File
									</MenuItem>
									<MenuItem sx={optionMenuItem}
											  onClick={()=>{
												  // addFolder(datasetId, "new folder", null);
												  setNewFolder(true);
												  handleOptionClose();
											  }
											  }>Add Folder</MenuItem>
									<CreateFolder datasetId={datasetId} parentFolder={folder} open={newFolder} handleClose={handleCloseNewFolder}/>
									<MenuItem sx={optionMenuItem}
											  onClick={() => {
												  downloadDataset(datasetId, about["name"]);
												  handleOptionClose();
											  }} disabled={true}>
										Download All
									</MenuItem>
									<MenuItem sx={optionMenuItem}
											  onClick={()=>{
												  deleteDataset(datasetId);
												  handleOptionClose();
												  // Go to Explore page
												  history("/");
											  }
									}>Delete Dataset</MenuItem>
									<MenuItem onClick={handleOptionClose} sx={optionMenuItem} disabled={true}>Delete Folder</MenuItem>
									<MenuItem onClick={handleOptionClose} sx={optionMenuItem} disabled={true}>Follow</MenuItem>
									<MenuItem onClick={handleOptionClose} sx={optionMenuItem} disabled={true}>Collaborators</MenuItem>
									<MenuItem onClick={handleOptionClose} sx={optionMenuItem} disabled={true}>Extraction</MenuItem>
								</Menu>
							</Box>
							<Divider />
							{
								about !== undefined ?
									<Box className="infoCard">
										<Typography className="title">About</Typography>
										<Box>
											<Typography className="content" sx={{display:"inline-block"}}>Name:&nbsp;</Typography>
											{
												editingNameOpen ?
													<>
														<ClowderInput required={true} id="name" onChange={(event) => {
															setDatasetName(event.target.value);}} defaultValue={about["name"]}
														/>
														<Box sx={{margin:"5px auto"}}>
															<Button onClick={()=>{ handleDatasetNameEdit();}} size={"small"} variant="outlined">Save</Button>
															<Button onClick={() => setEditingNameOpen(false)} size={"small"}>Cancel</Button>
														</Box>
													</>
													:
													<>
														<Typography className="content" sx={{display:"inline"}}>{about["name"]}</Typography>
														<Button onClick={() => setEditingNameOpen(true)} size={"small"} sx={{display:"inline"}}>Edit</Button>
													</>
											}
										</Box>
										<Box>
											<Typography className="content" sx={{display:"inline-block"}}>Description:&nbsp;</Typography>
											{
												editDescriptionOpen ?
													<>
														<ClowderInput
															id="description"
															defaultValue={about["description"]}
															multiline
															rows={4}
															onChange={(event) => {
																setDatasetDescription(event.target.value);}}
														/>
														<Box sx={{margin:"5px auto"}}>
															<Button onClick={handleDatasetDescriptionEdit} size={"small"} variant={"outlined"}>Save</Button>
															<Button onClick={() => setEditDescriptionOpen(false)} size={"small"}>Cancel</Button>
														</Box>
													</>
													:
													<>
														<Typography className="content" sx={{display:"inline"}}>{about["description"]}</Typography>
														<Button onClick={() => setEditDescriptionOpen(true)} size={"small"} sx={{display:"inline"}}>Edit</Button>
													</>
											}
										</Box>
										<Typography className="content">Dataset ID: {about["id"]}</Typography>
										<Typography className="content">
											Owner: {about["author"]["first_name"]} {about["author"]["last_name"]}
										</Typography>
										<Typography className="content">Created on: {parseDate(about["created"])}</Typography>
										<Typography className="content">Modified on: {parseDate(about["modified"])}</Typography>
										{/*/!*TODO use this to get thumbnail*!/*/}
										{/*<Typography className="content">Thumbnail: {about["thumbnail"]}</Typography>*/}
										{/*<Typography className="content">Belongs to spaces: {about["authorId"]}</Typography>*/}
										{/*/!*TODO not sure how to use this info*!/*/}
										{/*<Typography className="content">Resource type: {about["resource_type"]}</Typography>*/}
									</Box> : <></>
							}
							<Divider />
							<Box className="infoCard">
								<Typography className="title">Statistics</Typography>
								<Typography className="content">Views: 10</Typography>
								<Typography className="content">Last viewed: Jun 07, 2021 21:49:09</Typography>
								<Typography className="content">Downloads: 0</Typography>
								<Typography className="content">Last downloaded: Never</Typography>
							</Box>
							<Divider />
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
					<Dialog open={createFileOpen} onClose={()=>{setCreateFileOpen(false);}} fullWidth={true} aria-labelledby="form-dialog">
						<DialogTitle id="form-dialog-title">Add File</DialogTitle>
						<UploadFile selectedDatasetId={datasetId} folderId={folder} setOpen={setCreateFileOpen}/>
					</Dialog>
				</div>
			</div>
		</div>
	);
};
