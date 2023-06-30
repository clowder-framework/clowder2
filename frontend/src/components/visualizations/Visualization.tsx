import React, { Suspense, useEffect } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { getVizConfig as getVizConfigAction } from "../../actions/visualization";
import { vizComponentDefinitions } from "../../visualization.config";

type previewProps = {
	fileId?: string;
};
export const Visualization = (props: previewProps) => {
	const { fileId } = props;

	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);
	const vizConfig = useSelector(
		(state: RootState) => state.visualization.vizConfig
	);

	const dispatch = useDispatch();
	const listFileSummary = (fileId: string | undefined) =>
		dispatch(fetchFileSummary(fileId));

	const getVizConfig = (resourceId: string | undefined) =>
		dispatch(getVizConfigAction(resourceId));

	useEffect(() => {
		listFileSummary(fileId);
		getVizConfig(fileId);
	}, []);

	return (
		<>
			{vizComponentDefinitions.map((vizComponentDefinition) => {
				return (
					<LazyLoadErrorBoundary fallback={<div>Fail to load...</div>}>
						<Suspense fallback={<div>Loading...</div>}>
							{(() => {
								if (vizConfig.length > 0) {
									return vizConfig.map((vizConfigEntry) => {
										const componentName = vizConfigEntry.component_name;
										if (componentName === vizComponentDefinition.name) {
											return React.cloneElement(
												vizComponentDefinition.component,
												{
													visualizationId: vizConfigEntry.visualization,
												}
											);
										}
									});
								}
								// if no vizaulization config exist, guess which widget to use by looking at the mime type of
								// the raw bytes
								else {
									// match main type to instantiate components correspondingly
									if (
										fileSummary &&
										fileSummary.content_type !== undefined &&
										((fileSummary.content_type.content_type !== undefined &&
											vizComponentDefinition.mimeTypes.includes(
												fileSummary.content_type.content_type
											)) ||
											(fileSummary.content_type.main_type !== undefined &&
												fileSummary.content_type.main_type ===
													vizComponentDefinition.mainType))
									) {
										return React.cloneElement(
											vizComponentDefinition.component,
											{
												fileId: fileId,
											}
										);
									}
									return null;
								}
							})()}
						</Suspense>
					</LazyLoadErrorBoundary>
				);
			})}
		</>
	);
};
