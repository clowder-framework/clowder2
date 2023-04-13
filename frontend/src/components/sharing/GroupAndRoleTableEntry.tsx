import React, {useEffect, useState} from "react";
import {RootState} from "../../types/data";
import {fetchDatasetRoles} from "../../actions/dataset";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {GroupAndRole} from "../../openapi/v2";


type GroupAndRoleTableEntryProps = {
	group_role: GroupAndRole
}

export function GroupAndRoleTableEntry(props: GroupAndRoleTableEntryProps) {

	const {group_role} = props;

	const dispatch = useDispatch();

	return (
		<TableRow
			key={group_role.group.id}
			sx={{'&:last-child td, &:last-child th': {border: 0}}}
		>
			<TableCell>{group_role.group.name}</TableCell>
			<TableCell
				align="right">{group_role.role}</TableCell>
			<TableCell align="right"></TableCell>
		</TableRow>
	)
}
