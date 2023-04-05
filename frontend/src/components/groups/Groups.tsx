import React, {useEffect, useState} from "react";
import {Box, Button, ButtonGroup,} from "@mui/material";
import Layout from "../Layout";
import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchGroups} from "../../actions/group";
import {ArrowBack, ArrowForward} from "@material-ui/icons";
import {Link} from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import GroupsIcon from "@mui/icons-material/Groups";


export function Groups() {
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
			<TableContainer component={Paper}>
				<Table sx={{minWidth: 650}} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Group Name</TableCell>
							<TableCell align="right">Description</TableCell>
							<TableCell align="right"><GroupsIcon/></TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{
							groups.map((group) => {
								return (
									<TableRow key={group.id} sx={{"&:last-child td, &:last-child th": {border: 0}}}>
										<TableCell component="th" scope="row" key={group.id}>
											<Button component={Link} to={`/groups/${group.id}`}>
												{group.name}
											</Button>
										</TableCell>
										<TableCell component="th" scope="row" key={group.id} align="right">
											{group.description}
										</TableCell>
										<TableCell component="th" scope="row" key={group.id} align="right">
											{group.users !== undefined ? group.users.length : 0}
										</TableCell>
									</TableRow>
								)
							})
						}
					</TableBody>
				</Table>
			</TableContainer>
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
		</Layout>
	);
}
