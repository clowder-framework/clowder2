import React from "react";

import { ActionModal } from "../dialog/ActionModal";
import { deleteGroup } from "../../actions/group";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

type DeleteGroupModalProps = {
	deleteGroupConfirmOpen: any;
	setDeleteGroupConfirmOpen: any;
	groupId: string | undefined;
};

export default function DeleteGroupModal(props: DeleteGroupModalProps) {
	const { deleteGroupConfirmOpen, setDeleteGroupConfirmOpen, groupId } = props;
	const history = useNavigate();
	const dispatch = useDispatch();

	const groupDeleted = (groupId: string | undefined) =>
		dispatch(deleteGroup(groupId));
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
			actionLevel={"error"}
		/>
	);
}
