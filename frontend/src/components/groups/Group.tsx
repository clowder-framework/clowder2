import React, {useEffect, useState} from "react";
import {
	Box,
	Button,
	ButtonGroup,
	Divider,
	Grid,
	List,
} from "@mui/material";

import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchGroups} from "../../actions/group";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import {theme} from "../../theme";

type GroupProps = {}

export function Groups(props: GroupProps) {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listGroups = (skip: number | undefined, limit: number | undefined) =>
		dispatch(fetchGroups(skip, limit));

	const groups = useSelector((state: RootState) => state.group.groups);

	// TODO add option to determine limit number; default show 5 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit,] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);

	// component did mount
	useEffect(() => {
		listGroups(skip, limit);
	}, []);

	// fetch extractors from each individual dataset/id calls
	useEffect(() => {
		// disable flipping if reaches the last page
		if (groups.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [groups]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listGroups(skip, limit);
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
		if (groups.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	return (
		<>
			<Grid container>
				<Grid item xs={9}>
					<Box sx={{
						backgroundColor: theme.palette.primary.contrastText,
						padding: "3em"
					}}>
						<List>
							{
								groups !== undefined ?
									groups.map((group) => {
										return (<>
											<a>{group.name}</a>
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
				</Grid>
			</Grid>
		</>
	);
}
