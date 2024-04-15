import React, { ChangeEvent, useEffect, useState } from "react";

import {
	Box,
	Grid,
	List,
	ListItemButton,
	ListItemText,
	ListSubheader,
	Pagination,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { EventListenerOut as Listener } from "../../openapi/v2";
import Layout from "../Layout";
import { fetchListeners } from "../../actions/listeners";
import { ListenerInfo } from "./ListenerInfo";
import { ExtractionJobs } from "./ExtractionJobs";
import { ClowderTitle } from "../styledComponents/ClowderTitle";
import { ErrorModal } from "../errors/ErrorModal";
import config from "../../app.config";

export const ExtractionHistory = (): JSX.Element => {
	const dispatch = useDispatch();
	const listListeners = (
		skip: number | undefined,
		limit: number | undefined,
		heartbeatInterval: number | undefined,
		selectedCategory: string | null,
		selectedLabel: string | null,
		aliveOnly: boolean | undefined
	) =>
		dispatch(
			fetchListeners(
				skip,
				limit,
				heartbeatInterval,
				selectedCategory,
				selectedLabel,
				aliveOnly
			)
		);

	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);
	const listenerPageMetadata = useSelector(
		(state: RootState) => state.listener.listeners.metadata
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	const [errorOpen, setErrorOpen] = useState(false);
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultExtractionJobs);
	const [selectedExtractor, setSelectedExtractor] = useState<Listener>();
	const [selectedStatus, setSelectedStatus] = useState(null);
	const [selectedCreatedTime, setSelectedCreatedTime] = useState(null);
	const [aliveOnly, setAliveOnly] = useState<boolean>(false);

	useEffect(() => {
		listListeners(0, limit, 0, null, null, aliveOnly);
	}, []);

	useEffect(() => {
		listListeners((currPageNum - 1) * limit, limit, 0, null, null, aliveOnly);
	}, [adminMode]);

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listListeners(newSkip, limit, 0, null, null, aliveOnly);
	};

	return (
		<Layout>
			<Box className="outer-container">
				{/*Error Message dialogue*/}
				<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />

				{/*<Box className="inner-container">*/}
				<Grid container spacing={4}>
					<Grid item xs={12} sm={3} md={3} lg={3} xl={3} />
					<Grid item xs={12} sm={9} md={9} lg={9} xl={9}>
						{/*Extractor infos when selected*/}
						{selectedExtractor ? (
							<ListenerInfo selectedExtractor={selectedExtractor} />
						) : (
							<ClowderTitle>All Extractions</ClowderTitle>
						)}
					</Grid>
					<Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
						{/*Item list of listeners*/}
						<List
							sx={{ width: "100%", bgcolor: "background.paper" }}
							component="nav"
							aria-labelledby="list-extractions-subheader"
							subheader={
								<ListSubheader component="div" id="list-extractions-subheader">
									All Extractions
								</ListSubheader>
							}
						>
							{listeners !== undefined ? (
								listeners.map((listener) => {
									return (
										<ListItemButton
											onClick={() => {
												setSelectedExtractor(listener);
											}}
										>
											<ListItemText
												primary={listener.name.replace("private.", "")}
											/>
										</ListItemButton>
									);
								})
							) : (
								<></>
							)}
							{/*listner pagination*/}
							<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
								<Pagination
									count={Math.ceil(listenerPageMetadata.total_count / limit)}
									page={currPageNum}
									onChange={handlePageChange}
									shape="rounded"
									variant="outlined"
								/>
							</Box>
						</List>
					</Grid>
					<Grid item xs={12} sm={9} md={9} lg={9} xl={9}>
						{/*list of jobs*/}
						<ExtractionJobs
							selectedStatus={selectedStatus}
							selectedCreatedTime={selectedCreatedTime}
							setSelectedStatus={setSelectedStatus}
							setSelectedCreatedTime={setSelectedCreatedTime}
							selectedExtractor={selectedExtractor}
						/>
					</Grid>
				</Grid>
			</Box>
			{/*</Box>*/}
		</Layout>
	);
};
