import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import {fetchDatasetGroupsAndRoles, fetchDatasetUsersAndRoles} from "../../actions/authorization";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";


type GroupAndRole = {
	updateMetadata: any,
	deleteMetadata: any,
	resourceType: string | undefined,
	resourceId: string | undefined,
	version: number | undefined,
}

export const SharingTab = (): JSX.Element => {

	const {datasetId} = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();

	const getUsersAndRoles = (datasetId: string | undefined) => dispatch(fetchDatasetUsersAndRoles(datasetId));
	const getGroupsAndRoles = (datasetId: string | undefined) => dispatch(fetchDatasetGroupsAndRoles(datasetId));
	const datasetUsersAndRolesList = useSelector((state: RootState) => state.dataset.usersAndRoles);
	const datasetGroupsAndRolesList = useSelector((state: RootState) => state.dataset.groupsAndRoles);


	useEffect(() => {
		getUsersAndRoles(datasetId);
		console.log('users and roles', datasetUsersAndRolesList);

	}, []);

	useEffect(() => {
		getGroupsAndRoles(datasetId);
		console.log('groups and roles', datasetGroupsAndRolesList);
	}, []);


	return (
		<>
			{
				(() => {
					let groupRoleList = [];
					groupRoleList = datasetUsersAndRolesList;
					console.log(groupRoleList, 'groupRoleList');


					return <>this</>
			})()
			}
		</>
	)
}
