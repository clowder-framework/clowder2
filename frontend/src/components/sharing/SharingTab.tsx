import React, {useEffect, useState} from "react";

import {useDispatch, useSelector,} from "react-redux";
import {RootState} from "../../types/data";
import {fetchListenerJobs} from "../../actions/listeners";
import {format} from "date-fns";
import {parseDate} from "../../utils/common";


export const SharingTab = (props): JSX.Element => {
	const {datasetId, fileId} = props;

	const dispatch = useDispatch();
	

	return (
		<p>this</p>
	)
	;
}
