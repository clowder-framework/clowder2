import React, { lazy, Suspense, useEffect } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";

const Image = lazy(
	() => import(/* webpackChunkName: "previewers-image" */ "../previewers/Image")
);
const Audio = lazy(
	() => import(/* webpackChunkName: "previewers-audio" */ "../previewers/Audio")
);
const Video = lazy(
	() => import(/* webpackChunkName: "previewers-video" */ "../previewers/Video")
);

const Iframe = lazy(
	() =>
		import(/* webpackChunkName: "previewers-iframe" */ "../previewers/Iframe")
);

const Text = lazy(
	() => import(/* webpackChunkName: "previewers-text" */ "../previewers/Text")
);

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
				{fileSummary.content_type && (
					<>
						{fileSummary.content_type.main_type === "image" && (
							<Image fileId={fileId} />
						)}
						{fileSummary.content_type.main_type === "audio" && (
							<Audio fileId={fileId} />
						)}
						{fileSummary.content_type.main_type === "video" && (
							<Video fileId={fileId} />
						)}
						{fileSummary.content_type.main_type === "text" &&
							fileSummary.content_type.content_type === "text/html" && (
								<Iframe fileId={fileId} />
							)}
						{fileSummary.content_type.main_type === "text" &&
							fileSummary.content_type.content_type !== "text/html" && (
								<Text fileId={fileId} />
							)}
					</>
				)}
			</Suspense>
		</LazyLoadErrorBoundary>
	);
};
