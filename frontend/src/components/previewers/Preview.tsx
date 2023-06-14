import React, { Suspense, useEffect } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { vizConfig } from "../../visualization.config";

type previewProps = {
	fileId: string;
};
export const Preview = (props: previewProps) => {
	const { fileId } = props;

	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);

	const dispatch = useDispatch();
	const listFileSummary = (fileId: string | undefined) =>
		dispatch(fetchFileSummary(fileId));
	useEffect(() => {
		// load file information
		listFileSummary(fileId);
	}, []);

	return (
		<LazyLoadErrorBoundary fallback={<div>Fail to load...</div>}>
			<Suspense fallback={<div>Loading...</div>}>
				{(() => {
					return Object.keys(vizConfig).map((type) => {
						if (
							fileSummary &&
							fileSummary.content_type !== undefined &&
							type === fileSummary.content_type.main_type
						) {
							return React.cloneElement(vizConfig[type], { fileId: fileId });
						}
						return null; // Handle the case when the content_type doesn't match any vizConfig type
					});
				})()}
			</Suspense>
		</LazyLoadErrorBoundary>
	);
};
