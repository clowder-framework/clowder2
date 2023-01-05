import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {fetchListeners} from "../../actions/listeners";


export const ListenerFilter = (props) => {
	const {skip, limit} = props;
	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined) => dispatch(fetchListeners(skip, limit));

	return (

	);
}
