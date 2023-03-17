import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import {fetchDatasetGroupsAndRoles, fetchDatasetUsersAndRoles} from "../../actions/authorization";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";


export const SharingTab = (): JSX.Element => {

	const {datasetId} = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const getUsersAndRoles = (datasetId: string) => dispatch(fetchDatasetUsersAndRoles(datasetId));
	const getGroupsAndRoles = (datasetId: string) => dispatch(fetchDatasetGroupsAndRoles(datasetId));
	const datasetUsersAndRolesList = useSelector((state: RootState) => state.dataset.usersAndRoles);
	const datasetGroupsAndRolesList = useSelector((state: RootState) => state.dataset.groupsAndRoles);


	useEffect(() => {
		getUsersAndRoles(datasetId);
	}, []);

	useEffect(() => {
		getGroupsAndRoles(datasetId);
	}, []);


	console.log(datasetUsersAndRolesList);
	console.log(datasetGroupsAndRolesList);
	console.log('dataset group and user roles');


	return (
		<p>this</p>
	)
	;
}
