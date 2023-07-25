import React, { Suspense, useEffect } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { getVisConfig as getVisConfigAction } from "../../actions/visualization";
import { visComponentDefinitions } from "../../visualization.config";
import {
	Card,
	CardActions,
	CardContent,
	Grid,
	IconButton,
	IconButtonProps,
} from "@mui/material";
import { styled } from "@mui/styles";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StackedList } from "../util/StackedList";
import prettyBytes from "pretty-bytes";
import { parseDate } from "../../utils/common";

type previewProps = {
	fileId?: string;
	datasetId?: string;
};

interface ExpandMoreProps extends IconButtonProps {
	expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
	const { expand, ...other } = props;
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
	marginLeft: "auto",
	transition: theme.transitions.create("transform", {
		duration: theme.transitions.duration.shortest,
	}),
}));

export const Visualization = (props: previewProps) => {
	const { fileId, datasetId } = props;

	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);
	const visConfig = useSelector(
		(state: RootState) => state.visualization.visConfig
	);

	const [expanded, setExpanded] = React.useState(false);

	const handleExpandClick = () => {
		setExpanded(!expanded);
	};

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
											return visConfigEntry.visualization_data.map(
												(visualizationDataItem) => {
													const details = new Map();
													details.set(
														"Size",
														prettyBytes(visualizationDataItem.bytes ?? 0)
													);
													details.set(
														"Content type",
														visualizationDataItem.content_type
															? visualizationDataItem.content_type.content_type
															: "NA"
													);
													details.set(
														"Updated on",
														parseDate(visualizationDataItem.created)
													);
													details.set(
														"Uploaded as",
														visualizationDataItem.name
													);
													details.set(
														"Uploaded by",
														`${visualizationDataItem.creator.first_name}
														${visualizationDataItem.creator.last_name}`
													);
													details.set(
														"Visualization id",
														visualizationDataItem.id
													);
													details.set(
														"Descriptions",
														visualizationDataItem.description
													);

													return (
														<Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
															<Card>
																<CardContent>
																	{React.cloneElement(
																		visComponentDefinition.component,
																		{
																			visualizationId: visualizationDataItem.id,
																		}
																	)}
																</CardContent>
																<CardActions disableSpacing>
																	<ExpandMore
																		expand={expanded}
																		onClick={handleExpandClick}
																		aria-expanded={expanded}
																		aria-label="show more"
																	>
																		<ExpandMoreIcon />
																	</ExpandMore>
																</CardActions>
																<Collapse
																	in={expanded}
																	timeout="auto"
																	unmountOnExit
																>
																	<CardContent>
																		<StackedList keyValues={details} />
																	</CardContent>
																</Collapse>
															</Card>
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
