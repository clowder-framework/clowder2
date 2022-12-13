import React, {useEffect, useState} from "react";
import {Box, Button, ButtonGroup, Divider, List} from "@mui/material";

import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchListeners} from "../../actions/listeners";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import ListenerItem from "./ListenerItem";


export const Listeners = (): JSX.Element => {

	// Redux connect equivalent
	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined) => dispatch(fetchListeners(skip, limit));

	const listeners = useSelector((state: RootState) => state.listener.listeners);

	// TODO add option to determine limit number; default show 5 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit,] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);

	// component did mount
	useEffect(() => {
		listListeners(skip, limit);
	}, []);

	// fetch thumbnails from each individual dataset/id calls
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
		if (skip !== null && skip !== undefined) {
			listListeners(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	return (
		<Box>
			<List>
				{
					listeners !== undefined ?
						listeners.map((listener) => {
							return (<>
								<ListenerItem key={listener.id}
											  id={listener.id}
											  extractorName={listener.name}
											  extractorDescription={listener.description}
								/>
								<Divider/>
							</>);
						})
						:
						<></>
				}
			</List>
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
	)
}
