import React, {useEffect, useState} from "react";

import {
	Box,
	Button,
	ButtonGroup,
	Divider,
	Grid,
	List,
	ListItemButton,
	ListItemText,
	ListSubheader,
} from "@mui/material";
import {useDispatch, useSelector,} from "react-redux";
import {Listener, RootState} from "../../types/data";

import {ActionModal} from "../dialog/ActionModal";
import config from "../../app.config";
import {resetFailedReason} from "../../actions/common";
import {useNavigate} from "react-router-dom";
import Layout from "../Layout";
import {fetchListeners} from "../../actions/listeners";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import {ListenerInfo} from "./ListenerInfo";
import {ExtractionJobs} from "./ExtractionJobs";
import {parseDate} from "../../utils/common";
import {ClowderTitle} from "../styledComponents/ClowderTitle";


const createData = ( status:string, jobId: string, created: string, creator: string, duration: number, fileId: string,
						 datasetId: string,) => {
		return {
			status, jobId, created, creator, duration, fileId, datasetId
		};
	}

export const ExtractionHistory = (): JSX.Element => {

	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined, selectedCategory: string | null,
						   selectedLabel: string | null) =>
		dispatch(fetchListeners(skip, limit, selectedCategory, selectedLabel));
	const listeners = useSelector((state: RootState) => state.listener.listeners);

	// Error msg dialog
	const reason = useSelector((state: RootState) => state.error.reason);
	const stack = useSelector((state: RootState) => state.error.stack);
	const dismissError = () => dispatch(resetFailedReason());
	const [errorOpen, setErrorOpen] = useState(false);
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit,] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedExtractor, setSelectedExtractor] = useState<Listener>();

	useEffect(() => {
		listListeners(skip, limit, null, null);
	}, []);


	const history = useNavigate();

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listListeners(skip, limit, null, null);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	// fetch extractors from each individual dataset/id calls
	useEffect(() => {

		// disable flipping if reaches the last page
		if (listeners.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [listeners]);

	// for pagination keep flipping until the return dataset is less than the limit
	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (listeners.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	useEffect(() => {
		if (reason !== "" && reason !== null && reason !== undefined) {
			setErrorOpen(true);
		}
	}, [reason]);

	const handleErrorCancel = () => {
		// reset error message and close the error window
		dismissError();
		setErrorOpen(false);
	}
	const handleErrorReport = () => {
		window.open(`${config.GHIssueBaseURL}+${reason}&body=${encodeURIComponent(stack)}`);
	}

	const rows = [
	createData("StatusMessage.start: Started processing.","63d146bc79a3d39c7sgd0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "cwang138@illinois.edu", 500, "63d140925cda10061fcd6768"),
	createData("StatusMessage.processing: Downloading file.","63d146bc79a3d39a;ef0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 200, "63d140925cda10061fcd6768"),
	createData("StatusMessage.processing: Loading contents of file...", "a63d146bc793d39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "cwang138@illinois.edu", 1200, "63d140925cda10061fcd6768"),
	createData("StatusMessage.processing: Found 21 lines and 162 words...", "79a3d63d146bc39c71d0e0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 700, "63d140925cda10061fcd6768"),
	createData("StatusMessage.processing: Uploading file metadata.","63d146bc7939c71d0a3de0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 920, "63d140925cda10061fcd6768"),
	createData("StatusMessage.done: Done processing.", "63d146b9c71d0c79a3d3e0b1", parseDate("2023-01-25T15:11:56.615Z"), "mburnet2@illinois.edu", 1100, "63d140925cda10061fcd6768"),
	createData("StatusMessage.processing: Uploading file metadata.","63dd0e0b1146bc79a3d39c71", parseDate("2023-01-25T15:11:56.615Z"), "cwang138@illinois.edu", 130, "63d140925cda10061fcd6768"),
];

	const headCells = [
		{
		id: "status",
		label: "",
	},
	{
		id: "jobId",
		label: "Job ID",
	},
	{
		id: "created",
		label: "Submitted At",
	},
	{
		id: "creator",
		label: "Submitted By",
	},
	{
		id: "duration",
		label: "Duration",
	},
	{
		id: "fileId",
		label: "Resource Id",
	},
];

	return (
		<Layout>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				<Box className="inner-container">
					<Grid container spacing={4}>
						<Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
							{/*Item list of listeners*/}
							<List
								sx={{width: '100%', bgcolor: 'background.paper'}}
								component="nav"
								aria-labelledby="list-extractions-subheader"
								subheader={
									<ListSubheader component="div" id="list-extractions-subheader">
										All Extractions
									</ListSubheader>
								}
							>
								{
									listeners !== undefined ?
										listeners.map((listener) => {
											return (
												<ListItemButton onClick={() => {
													setSelectedExtractor(listener);
												}}>
													<ListItemText primary={listener.name}/>
												</ListItemButton>
											);
										})
										:
										<></>
								}
								{/*pagination*/}
								<Box display="flex" justifyContent="center" sx={{m: 1}}>
									<ButtonGroup variant="contained" aria-label="previous next buttons">
										<Button aria-label="previous" onClick={previous} disabled={prevDisabled}>
											<ArrowBack/> Prev
										</Button>
										<Button aria-label="next" onClick={next} disabled={nextDisabled}>
											Next <ArrowForward/>
										</Button>
									</ButtonGroup>
								</Box>
							</List>
						</Grid>
						<Grid item xs={12} sm={9} md={9} lg={9} xl={9}>
							{/*Extractor infos when selected*/}
							<Box sx={{marginBottom: "2em"}}>
								{
									selectedExtractor ?
											<ListenerInfo selectedExtractor={selectedExtractor}/>

										:
										<ClowderTitle>All Extractions</ClowderTitle>

								}
							</Box>

							{/*list of jobs*/}
							<Box>
								<ExtractionJobs rows={rows} headCells={headCells}/>
							</Box>
						</Grid>
					</Grid>
				</Box>
			</Box>
		</Layout>
	);
}
