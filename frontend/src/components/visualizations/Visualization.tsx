import React, { Suspense, useEffect } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { getVisConfig as getVisConfigAction } from "../../actions/visualization";
import { visComponentDefinitions } from "../../visualization.config";
import { Grid } from "@mui/material";

type previewProps = {
	fileId?: string;
};
export const Visualization = (props: previewProps) => {
	const { fileId } = props;

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
		listFileSummary(fileId);
		getVisConfig(fileId);
	}, []);

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
											return visConfigEntry.visualization_bytes_ids.map(
												(visualizationId) => {
													return (
														<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
															{React.cloneElement(
																visComponentDefinition.component,
																{
																	visualizationId: visualizationId,
																}
															)}
														</Grid>
													);
												}
											);
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
											<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
												{React.cloneElement(visComponentDefinition.component, {
													fileId: fileId,
												})}
											</Grid>
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
