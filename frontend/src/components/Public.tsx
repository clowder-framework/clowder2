import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Grid, Tab, Tabs } from "@mui/material";

import { RootState } from "../types/data";
import { useDispatch, useSelector } from "react-redux";
import {fetchPublicDatasets} from "../actions/public_dataset";

import { a11yProps, TabPanel } from "./tabs/TabComponent";
import DatasetCard from "./datasets/DatasetCard";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import Layout from "./Layout";
import { Link as RouterLink } from "react-router-dom";
import { Listeners } from "./listeners/Listeners";
import { ErrorModal } from "./errors/ErrorModal";

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
	const publicDatasetState = useSelector(
		(state: RootState) => state.publicDataset
	);

	const public_datasets = useSelector((state: RootState) => state.publicDataset.public_datasets);

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
		console.log("trying to get public datasets");
		listPublicDatasets(0, limit);
		console.log(publicDatasetState);
	}, []);


	return (
		<>Nothing yet</>
	);
};
