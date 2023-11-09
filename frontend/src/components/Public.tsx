import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Grid, Tab, Tabs } from "@mui/material";

import { RootState } from "../types/data";
import { useDispatch, useSelector } from "react-redux";
import {fetchPublicDatasets} from "../actions/dataset";

import { a11yProps, TabPanel } from "./tabs/TabComponent";
import DatasetCard from "./datasets/DatasetCard";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import Layout from "./Layout";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Listeners } from "./listeners/Listeners";
import { ErrorModal } from "./errors/ErrorModal";
import Typography from "@mui/material/Typography";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

export const Public = (): JSX.Element => {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listPublicDatasets = (
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchPublicDatasets(skip, limit));
	const publicDatasets = useSelector((state: RootState) => state.dataset.publicDatasets);

	// TODO add option to determine limit number; default show 5 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	// TODO add switch to turn on and off "mine" dataset
	const [mine] = useState<boolean>(false);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState(0);
	const [errorOpen, setErrorOpen] = useState(false);

	// component did mount
	useEffect(() => {
		console.log('trying to get public datasets');
		listPublicDatasets(0, limit);
	}, []);

	// fetch thumbnails from each individual dataset/id calls
	useEffect(() => {
		// disable flipping if reaches the last page
		if (publicDatasets !== undefined && publicDatasets.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [publicDatasets]);

	// switch tabs
	const handleTabChange = (
		_event: React.ChangeEvent<{}>,
		newTabIndex: number
	) => {
		setSelectedTabIndex(newTabIndex);
	};

	// for pagination keep flipping until the return dataset is less than the limit
	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (publicDatasets.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};
	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listPublicDatasets(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />

			<Grid container spacing={4}>
				<Grid item xs>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={selectedTabIndex}
							onChange={handleTabChange}
							aria-label="dashboard tabs"
						>
							<Tab sx={tab} label="Datasets" {...a11yProps(0)} />
							<Tab sx={tab} label="Extractors" {...a11yProps(1)} />
						</Tabs>
					</Box>
					<TabPanel value={selectedTabIndex} index={0}>
						<Grid container spacing={2}>
							{publicDatasets !== undefined ?  (
								publicDatasets.map((dataset) => {
									return (
										<Grid item key={dataset.id} xs={12} sm={6} md={4} lg={3}>
											<Typography>
												{dataset.name}
											</Typography>
										</Grid>
									);
								})
							) : (
								<></>
							)}
							{publicDatasets !== undefined && publicDatasets.length === 0 ? (
								<Grid container justifyContent="center">
									<Box textAlign="center">
										<p>Nobody has created any datasets on this instance. Click below to create a dataset!</p>
										<Button component={RouterLink} to="/create-dataset"
											variant="contained"
											sx={{ m: 2 }}
										>
										Create Dataset
										</Button>
									</Box>
								</Grid>
							) : (
								<></>
							)}
						</Grid>
						{publicDatasets !== undefined && publicDatasets.length !== 0 ? (
							<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
								<ButtonGroup
									variant="contained"
									aria-label="previous next buttons"
								>
									<Button
										aria-label="previous"
										onClick={previous}
										disabled={prevDisabled}
									>
										<ArrowBack /> Prev
									</Button>
									<Button
										aria-label="next"
										onClick={next}
										disabled={nextDisabled}
									>
										Next <ArrowForward />
									</Button>
								</ButtonGroup>
							</Box>
						): (
							<></>
						)}
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={1}>
						<Listeners />
					</TabPanel>
					<TabPanel value={selectedTabIndex} index={4} />
					<TabPanel value={selectedTabIndex} index={2} />
					<TabPanel value={selectedTabIndex} index={3} />
				</Grid>
			</Grid>
		</Layout>
	);
};
