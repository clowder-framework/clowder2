import React, {useEffect, useState} from "react";

import {
	Box, Button, ButtonGroup, Divider,
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
import ListenerItem from "./ListenerItem";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import {ListenerInfo} from "./ListenerInfo";


export const ListenerExtractionHistory = (): JSX.Element => {

	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined, selectedCategory: string | null,
						   selectedLabel: string | null ) =>
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

	return (
		<Layout>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ActionModal actionOpen={errorOpen} actionTitle="Something went wrong..." actionText={reason}
							 actionBtnName="Report" handleActionBtnClick={handleErrorReport}
							 handleActionCancel={handleErrorCancel}/>
				<Box className="inner-container">
					{/*Item list of listeners*/}
					<List
					  sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
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
										  <ListItemButton onClick={() => { setSelectedExtractor(listener); }}>
											<ListItemText primary={listener.name} />
										  </ListItemButton>
									);
								})
								:
								<></>
						}
					</List>
					<ListenerInfo selectedExtractor={selectedExtractor}/>
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
				</Box>
			</Box>
		</Layout>
		);
}
