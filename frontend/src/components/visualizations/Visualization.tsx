import React, { Suspense, useEffect } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { getVisConfig as getVisConfigAction } from "../../actions/visualization";
import { visComponentDefinitions } from "../../visualization.config";
import { Grid } from "@mui/material";
import { VisualizationCard } from "./VisualizationCard";
import { VisualizationRawBytesCard } from "./VisualizationRawBytesCard";
import { VisualizationSpecCard } from "./VisualizationSpecCard";

type previewProps = {
	fileId?: string;
	datasetId?: string;
};

export const Visualization = (props: previewProps) => {
	const { fileId, datasetId } = props;

	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);
	const visConfig = useSelector(
		(state: RootState) => state.visualization.visConfig
	);

	const dispatch = useDispatch();
	const listFileSummary = (fileId: string | undefined) =>
		dispatch(fetchFileSummary(fileId));

	const getVisConfig = (resourceId: string | undefined) =>
		dispatch(getVisConfigAction(resourceId));

	useEffect(() => {
		if (fileId !== undefined) {
			listFileSummary(fileId);
			getVisConfig(fileId);
		}

		if (datasetId !== undefined) {
			getVisConfig(datasetId);
		}
	}, [fileId, datasetId]);

	return (
		<Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 3, md: 3 }}>
			{/* 1. load all the visualization components and its definition available to the frontend */}
			{visComponentDefinitions.map((visComponentDefinition) => {
				return (
					<LazyLoadErrorBoundary fallback={<div>Fail to load...</div>}>
						<Suspense fallback={<div>Loading...</div>}>
							{(() => {
								// 2. looking for visualization configuration registered for this resource
								if (visConfig.length > 0) {
									return visConfig.map((visConfigEntry) => {
										// instantiate the matching visualization component if documented
										// in configuration
										const componentName =
											visConfigEntry.visualization_component_id;
										if (componentName === visComponentDefinition.name) {
											// use visualization data if available
											if (
												visConfigEntry.visualization_data &&
												visConfigEntry.visualization_data?.length > 0
											) {
												return visConfigEntry.visualization_data.map(
													(visualizationDataItem) => {
														return (
															<VisualizationCard
																visualizationDataItem={visualizationDataItem}
																visComponentDefinition={visComponentDefinition}
															/>
														);
													}
												);
											} else {
												// use visualization parameters if available
												if (Object.keys(visConfigEntry.parameters).length > 0) {
													return (
														<VisualizationSpecCard
															visComponentDefinition={visComponentDefinition}
															visConfigEntry={visConfigEntry}
														/>
													);
												} else {
													console.log(
														"No visualization data or parameters available. " +
															"Incomplete visualization configuration."
													);
												}
											}
										}
									});
								}
								// if no visualization config exist, guess which widget to use by looking at the mime type of
								// the raw bytes
								else {
									// try match mime type first
									// then fallback to match main type
									// to instantiate components correspondingly
									if (
										fileSummary &&
										fileSummary.content_type !== undefined &&
										((fileSummary.content_type.content_type !== undefined &&
											visComponentDefinition.mimeTypes.includes(
												fileSummary.content_type.content_type
											)) ||
											(fileSummary.content_type.main_type !== undefined &&
												fileSummary.content_type.main_type ===
													visComponentDefinition.mainType))
									) {
										return (
											<VisualizationRawBytesCard
												visComponentDefinition={visComponentDefinition}
												fileId={fileId}
											/>
										);
									}
									return null;
								}
							})()}
						</Suspense>
					</LazyLoadErrorBoundary>
				);
			})}
		</Grid>
	);
};
