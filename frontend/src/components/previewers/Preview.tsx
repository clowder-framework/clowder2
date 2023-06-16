import React, { lazy, Suspense, useEffect, useState } from "react";
import { LazyLoadErrorBoundary } from "../errors/LazyLoadErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { fetchFileSummary } from "../../actions/file";
import { registerDecorator } from "./VizDecorator";

type previewProps = {
	fileId?: string;
};
export const Preview = (props: previewProps) => {
	const { fileId } = props;

	const [vizConfig, setVizConfig] = useState({});

	const fileSummary = useSelector((state: RootState) => state.file.fileSummary);

	const dispatch = useDispatch();
	const listFileSummary = (fileId: string | undefined) =>
		dispatch(fetchFileSummary(fileId));
	useEffect(() => {
		// load viz
		const vizPackageNames = registerDecorator.GetImplementations();
		vizPackageNames.map((vizPackageName) => {
			const config = require(`./${vizPackageName}/manifest.json`);
			const vizPackage = lazy(
				() =>
					import(
						/* webpackChunkName: `previewers-${vizPackage}` */ `./${vizPackageName}/${config.main}`
					)
			);
			setVizConfig((prevVizConfig) => ({
				...prevVizConfig,
				[config.vizConfig.mainType]: vizPackage,
			}));
		});
		// load file information
		listFileSummary(fileId);
	}, []);

	return (
		<LazyLoadErrorBoundary fallback={<div>Fail to load...</div>}>
			<Suspense fallback={<div>Loading...</div>}>
				{(() => {
					return Object.keys(vizConfig).map((type) => {
						// match main type to instantiate components correspondingly
						if (
							fileSummary &&
							fileSummary.content_type !== undefined &&
							type === fileSummary.content_type.main_type
						) {
							return React.cloneElement(vizConfig[type], { fileId: fileId });
						}
						return null;
					});
				})()}
			</Suspense>
		</LazyLoadErrorBoundary>
	);
};
