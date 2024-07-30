import React, { ChangeEvent, useEffect, useState } from "react";
import { Box, Button, Grid, Pagination } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../../actions/project";

import ProjectCard from "./ProjectCard";
import Layout from "../Layout";
import { Link as RouterLink } from "react-router-dom";
import { ErrorModal } from "../errors/ErrorModal";
import config from "../../app.config";
import { RootState } from "../../types/data";

export const Projects = (): JSX.Element => {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listProjects = (skip: number | undefined, limit: number | undefined) =>
		dispatch(fetchProjects(skip, limit));
	const projects = useSelector(
		(state: RootState) => state.project.projects.data
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.project.projects.metadata
	);

	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultProjectPerPage);
	const [errorOpen, setErrorOpen] = useState(false);

	// Admin mode will fetch all projects
	useEffect(() => {
		listProjects((currPageNum - 1) * limit, limit);
	}, [currPageNum, limit]);

	// pagination
	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listProjects(newSkip, limit);
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			<Grid container spacing={4}>
				<Grid item xs>
					<Grid container spacing={2}>
						{projects !== undefined ? (
							projects.map((project) => {
								return (
									<Grid item key={project.id} xs={12} sm={6} md={4} lg={3}>
										<ProjectCard
											id={project.id}
											name={project.name}
											author={`${project.creator.first_name} ${project.creator.last_name}`}
											created={project.created}
											description={project.description}
											numFiles={project.file_ids ? project.file_ids.length : 0}
											numFolders={
												project.folder_ids ? project.folder_ids.length : 0
											}
											numDatasets={
												project.dataset_ids ? project.dataset_ids.length : 0
											}
										/>
									</Grid>
								);
							})
						) : (
							<></>
						)}
						{projects.length === 0 ? (
							<Grid container justifyContent="center">
								<Box textAlign="center">
									<p>
										Nobody has created any projects on this instance. Click
										below to create a project!
									</p>
									<Button
										component={RouterLink}
										to="/create-project"
										variant="contained"
										sx={{ m: 2 }}
									>
										Create Project
									</Button>
								</Box>
							</Grid>
						) : (
							<></>
						)}
					</Grid>
					{projects.length !== 0 ? (
						<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
							<Pagination
								count={Math.ceil(pageMetadata.total_count / limit)}
								page={currPageNum}
								onChange={handlePageChange}
								shape="rounded"
								variant="outlined"
							/>
						</Box>
					) : (
						<></>
					)}
				</Grid>
			</Grid>
		</Layout>
	);
};
