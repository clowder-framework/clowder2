import React, { Suspense, useEffect } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { getVizConfig as getVizConfigAction } from "../../actions/visualization";
import { vizConfig as vizComponentDefinitions } from "../../visualization.config";

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
		<LazyLoadErrorBoundary fallback={<div>Fail to load...</div>}>
			<Suspense fallback={<div>Loading...</div>}>
				{(() => {
					// if (vizConfig.length > 0) {
					// }
					// // if no vizaulization config exist, use default definition matching with raw bytes
					// else {
					return Object.keys(vizComponentDefinitions).map((type) => {
						// match main type to instantiate components correspondingly
						if (
							fileSummary &&
							fileSummary.content_type !== undefined &&
							type === fileSummary.content_type.main_type
						) {
							return React.cloneElement(vizComponentDefinitions[type], {
								fileId: fileId,
							});
						}
						return null;
					});
					// }
				})()}
			</Suspense>
		</LazyLoadErrorBoundary>
	);
};
