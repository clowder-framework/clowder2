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
import {fetchDatasets} from "../actions/dataset";

const tab = {
	fontStyle: "normal",
	fontWeight: "normal",
	fontSize: "16px",
	textTransform: "capitalize",
};

export const Public = (): JSX.Element => {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const [limit] = useState<number>(20);
	// TODO add switch to turn on and off "mine" dataset
	const [mine] = useState<boolean>(false);
	const listPublicDatasets = (
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchPublicDatasets(skip, limit));

	const listDatasets = (
		skip: number | undefined,
		limit: number | undefined,
		mine: boolean | undefined
	) => dispatch(fetchDatasets(skip, limit, mine));
	const datasets = useSelector((state: RootState) => state.dataset.datasets);


	const public_datasets = useSelector((state: RootState) => state.publicDataset.public_datasets);

	useEffect(() => {
		listPublicDatasets(0, limit);
		listDatasets(0, limit, mine);
	}, []);



	return (
		<>Nothing yet</>
	);
};
