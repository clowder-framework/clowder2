import React, {useEffect, useState} from "react";
import {
	Box,
	Button,
	ButtonGroup, CardActionArea,
	Divider,
	Grid,
	List,
} from "@mui/material";
import Layout from "../Layout";
import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchGroups} from "../../actions/group";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import Typography from '@mui/material/Typography';
import {theme} from "../../theme";
import {Link} from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

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
		<Layout>
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
											<Card key={group.id} sx={{height: "100%", display: "flex", flexDirection: "row"}}>
												<CardContent>
													<CardActionArea component={Link} to={`/groups/${group.id}`} sx={{height: "100%"}}>
														<Typography variant="h5">{group.name}</Typography>
														<Typography color="secondary">
															{group.users !== undefined ? group.users.length : 0} users
														</Typography>
														<Typography variant="body2" sx={{
															overflow: 'hidden',
															textOverflow: 'ellipsis',
															display: '-webkit-box',
															WebkitLineClamp: '5',
															WebkitBoxOrient: 'vertical',
														}}>
															{group.description}
														</Typography>
													</CardActionArea>
												</CardContent>
											</Card>
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
		</Layout>
	);
}
