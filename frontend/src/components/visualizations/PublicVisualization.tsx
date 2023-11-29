import React, { Suspense, useEffect, useState } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { getVisConfig as getVisConfigAction } from "../../actions/visualization";
import {getPublicVisConfig, getPublicVisConfig as getPublicVisConfigAction} from "../../actions/public_visualization";
import { visComponentDefinitions } from "../../visualization.config";
import { Grid } from "@mui/material";
import { VisualizationCard } from "./VisualizationCard";
import { VisualizationRawBytesCard } from "./VisualizationRawBytesCard";
import { VisualizationSpecCard } from "./VisualizationSpecCard";
import config from "../../app.config";

type previewProps = {
	fileId?: string;
	datasetId?: string;
};

export const PublicVisualization = (props: previewProps) => {
	const { fileId, datasetId } = props;
	//const flag = false;
	const [isEmptyVisData, setIsEmptyVisData] = useState(false);
	const [isVisDataGreaterThanMaxSize, setIsVisDataGreaterThanMaxSize] =
		useState(false);
	const [isRawDataSupported, setIsRawDataSupported] = useState(false);

	const publicFileSummary = useSelector((state: RootState) => state.publicFile.publicFileSummary);
	const publicVisConfig = useSelector(
		(state: RootState) => state.publicVisualization.publicVisConfig
	);

	const dispatch = useDispatch();
	const listPublicFileSummary = (fileId: string | undefined) =>
		dispatch(fetchFileSummary(fileId));

	const getPublicVisConfig = (resourceId: string | undefined) =>
		dispatch(getPublicVisConfigAction(resourceId));

	useEffect(() => {
		if (fileId !== undefined) {
			listPublicFileSummary(fileId);
			getPublicVisConfig(fileId);
		}

		if (datasetId !== undefined) {
			getPublicVisConfig(datasetId);
		}
	}, [fileId, datasetId]);

	// Check for conditions and set state only once
	useEffect(() => {
		const supportedMimeType = visComponentDefinitions.reduce(
			(acc, visComponentDefinition) => {
				// @ts-ignore
				if (!acc.includes(visComponentDefinition.mainType)) {
					// @ts-ignore
					acc.push(visComponentDefinition.mainType);
				}
				return acc;
			},
			[]
		);
		// if raw type supported
		if (
			publicFileSummary&&
			((publicFileSummary.content_type && publicFileSummary.content_type.content_type !== undefined &&
						// @ts-ignore
				supportedMimeType.includes(fileSummary.content_type.content_type)) ||
				(publicFileSummary.content_type && publicFileSummary.content_type.main_type !== undefined &&
							// @ts-ignore
					supportedMimeType.includes(publicFileSummary.content_type.main_type)))
		) {
			setIsRawDataSupported(true);
		} else {
			setIsRawDataSupported(false);
		}

		if (publicFileSummary &&
			publicFileSummary.bytes && publicFileSummary.bytes >= config["rawDataVisualizationThreshold"]) {
				setIsVisDataGreaterThanMaxSize(true);
		} else {
			setIsVisDataGreaterThanMaxSize(false);
		}

		setIsEmptyVisData(publicVisConfig.length === 0);
	}, [publicFileSummary, publicVisConfig]);

	return (
		<Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 3, md: 3 }}>
			{isEmptyVisData && !isRawDataSupported? (
				<div>
					No visualization data or parameters available. Incomplete
					visualization configuration.
				</div>
			) : (
				<></>
			)}
			{isEmptyVisData && isRawDataSupported && isVisDataGreaterThanMaxSize ? (
				<div>File is greater than threshold</div>
			) : (
				<></>
			)}
			{/* 1. load all the visualization components and its definition available to the frontend */}
			{visComponentDefinitions.map((visComponentDefinition) => {
				return (
					<LazyLoadErrorBoundary fallback={<div>Fail to load...</div>}>
						<Suspense fallback={<div>Loading...</div>}>
							{(() => {
								// 2. looking for visualization configuration registered for this resource
								if (publicVisConfig.length > 0) {
									return publicVisConfig.map((visConfigEntry) => {
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
												}
											}
										}
									});
								}
								// if no visualization config exist, guess which widget to use by looking at the mime type of
								// the raw bytes
								else {
									//to make sure file size is less than threshold
									if (
										fileSummary &&
										fileSummary.bytes &&
										fileSummary.bytes <
											config["rawDataVisualizationThreshold"] &&
										fileSummary.content_type !== undefined &&
										((fileSummary.content_type.content_type !== undefined &&
											visComponentDefinition.mimeTypes.includes(
												fileSummary.content_type.content_type
											)) ||
											(fileSummary.content_type.content_type === undefined &&
												fileSummary.content_type.main_type !== undefined &&
												fileSummary.content_type.main_type ===
													visComponentDefinition.mainType))
									) {
										return (
											<VisualizationRawBytesCard
												visComponentDefinition={visComponentDefinition}
												fileId={fileId}
											/>
										);
									} else {
										return null;
									}
								}
							})()}
						</Suspense>
					</LazyLoadErrorBoundary>
				);
			})}
		</Grid>
	);
};
