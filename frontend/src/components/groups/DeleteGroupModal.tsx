import React from "react";

import { ActionModal } from "../dialog/ActionModal";
import { deleteGroup } from "../../actions/group";
import { useNavigate } from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../../types/data";

type DeleteGroupModalProps = {
	deleteGroupConfirmOpen: any;
	setDeleteGroupConfirmOpen: any;
	groupId: string | undefined;
};

export default function DeleteGroupModal(props: DeleteGroupModalProps) {
	const { deleteGroupConfirmOpen, setDeleteGroupConfirmOpen, groupId } = props;
	const history = useNavigate();
	const dispatch = useDispatch();

	const adminMode = useSelector((state: RootState) => state.user.adminMode);
	const groupDeleted = (groupId: string | undefined) =>
		dispatch(deleteGroup(groupId, adminMode));
	return (
		<ActionModal
			actionOpen={deleteGroupConfirmOpen}
			actionTitle="Are you sure?"
			actionText="Do you really want to delete this group? This process cannot be undone."
			actionBtnName="Delete"
			handleActionBtnClick={() => {
				groupDeleted(groupId);
				setDeleteGroupConfirmOpen(false);
				// Go to all groups page
				history("/groups");
			}}
			handleActionCancel={() => {
				setDeleteGroupConfirmOpen(false);
			}}
		/>
	);
}
