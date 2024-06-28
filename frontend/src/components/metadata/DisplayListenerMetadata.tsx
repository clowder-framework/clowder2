import React, { useEffect } from "react";
import { Box, Grid } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import {
	fetchDatasetMetadata,
	fetchFileMetadata,
	fetchMetadataDefinitions,
	fetchPublicDatasetMetadata,
	fetchPublicFileMetadata,
	fetchPublicMetadataDefinitions,
} from "../../actions/metadata";
import { ListenerMetadataEntry } from "./ListenerMetadataEntry";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

type MetadataType = {
	resourceType: string | undefined;
	resourceId: string | undefined;
	version: number | undefined;
	publicView: boolean | false;
};

/*
This is the interface displayed already created metadata and allow eidts
Uses only the list of metadata
*/
export const DisplayListenerMetadata = (props: MetadataType) => {
	const { resourceType, resourceId, version, publicView } = props;

	const dispatch = useDispatch();

	const getMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchMetadataDefinitions(name, skip, limit));

	const getPublicMetadatDefinitions = (
		name: string | null,
		skip: number,
		limit: number
	) => dispatch(fetchPublicMetadataDefinitions(name, skip, limit));

	const listDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchDatasetMetadata(datasetId));
	const listFileMetadata = (
		fileId: string | undefined,
		version: number | undefined
	) => dispatch(fetchFileMetadata(fileId, version));
	const listPublicFileMetadata = (
		fileId: string | undefined,
		version: number | undefined
	) => dispatch(fetchPublicFileMetadata(fileId, version));
	const listPublicDatasetMetadata = (datasetId: string | undefined) =>
		dispatch(fetchPublicDatasetMetadata(datasetId));

	const datasetMetadataList = useSelector(
		(state: RootState) => state.metadata.datasetMetadataList
	);
	const fileMetadataList = useSelector(
		(state: RootState) => state.metadata.fileMetadataList
	);
	const publicDatasetMetadataList = useSelector(
		(state: RootState) => state.metadata.publicDatasetMetadataList
	);
	const publicFileMetadataList = useSelector(
		(state: RootState) => state.metadata.publicFileMetadataList
	);

	useEffect(() => {
		if (publicView) {
			getPublicMetadatDefinitions(null, 0, 100);
		} else {
			getMetadatDefinitions(null, 0, 100);
		}
	}, []);

	// complete metadata list with both definition and values
	useEffect(() => {
		if (resourceType === "dataset") {
			if (publicView) {
				listPublicDatasetMetadata(resourceId);
			} else {
				listDatasetMetadata(resourceId);
			}
		} else if (resourceType === "file") {
			if (publicView) {
				listPublicFileMetadata(resourceId, version);
			} else {
				listFileMetadata(resourceId, version);
			}
		}
	}, [resourceType, resourceId, version]);
	return (
		<>
			{(() => {
				let metadataList = [];
				if (resourceType === "dataset" && !publicView)
					metadataList = datasetMetadataList;
				else if (resourceType === "file" && !publicView)
					metadataList = fileMetadataList;
				else if (resourceType === "file" && publicView)
					metadataList = publicFileMetadataList;
				else if (resourceType === "dataset" && publicView)
					metadataList = publicDatasetMetadataList;
				let hasAgentMetadata = false;
				metadataList.map((metadata, idx) => {
					if (metadata.agent.listener !== null) {
						hasAgentMetadata = true;
					}
				});
				if (hasAgentMetadata) {
					return (
						<Grid container spacing={2}>
							{metadataList.map((metadata, idx) => {
								if (metadata.agent.listener !== null) {
									return (
										<Grid item xs={12} key={idx}>
											<Card>
												<CardContent>
													<ListenerMetadataEntry
														agent={metadata.agent}
														content={metadata.content}
														context={metadata.context}
														context_url={metadata.context_url}
														created={metadata.created}
													/>
												</CardContent>
											</Card>
										</Grid>
									);
								}
							})}
						</Grid>
					);
				} else {
					return (
						<Box textAlign="left">
							<p>
								Currently there is no machine metadata. This means either no
								listeners are enabled for this resource, or that this resource
								has not been submitted to any listeners.
							</p>
						</Box>
					);
				}
			})()}
		</>
	);
};
