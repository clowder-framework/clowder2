import React, { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { fetchListenerJobs } from "../../actions/listeners";
import { ExtractionJobs } from "./ExtractionJobs";
import { format } from "date-fns";

export const ExtractionHistoryTab = (props): JSX.Element => {
	const { datasetId, fileId } = props;

	const dispatch = useDispatch();

	const [selectedStatus, setSelectedStatus] = useState(null);
	const [selectedCreatedTime, setSelectedCreatedTime] = useState(null);

	useEffect(() => {
		// TODO add pagination for jobs
		dispatch(
			fetchListenerJobs(
				null,
				selectedStatus,
				null,
				fileId,
				datasetId,
				selectedCreatedTime ? format(selectedCreatedTime, "yyyy-MM-dd") : null,
				0,
				100
			)
		);
	}, [selectedStatus, selectedCreatedTime, dispatch]);

	return (
		<ExtractionJobs
			selectedStatus={selectedStatus}
			selectedCreatedTime={selectedCreatedTime}
			setSelectedStatus={setSelectedStatus}
			setSelectedCreatedTime={setSelectedCreatedTime}
			fileId={fileId}
			datasetId={datasetId}
		/>
	);
};
