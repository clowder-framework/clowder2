import React from "react";

import { ActionModal } from "../dialog/ActionModal";
import { deleteMetadataDefinition as deleteMetadataDefinitionAction } from "../../actions/metadata";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

type DeleteMetadataDefinitionModalProps = {
	deleteMetadataDefinitionConfirmOpen: any;
	setDeleteMetadataDefinitionConfirmOpen: any;
	metdataDefinitionId: string | undefined;
};

export default function DeleteMetadataDefinitionModal(
	props: DeleteMetadataDefinitionModalProps
) {
	const {
		deleteMetadataDefinitionConfirmOpen,
		setDeleteMetadataDefinitionConfirmOpen,
		metdataDefinitionId,
	} = props;
	const history = useNavigate();
	const dispatch = useDispatch();
	const deleteMetadataDefinition = (metadataDefinitionId: string | undefined) =>
		dispatch(deleteMetadataDefinitionAction(metadataDefinitionId));
	return (
		<ActionModal
			actionOpen={deleteMetadataDefinitionConfirmOpen}
			actionTitle="Are you sure?"
			actionText="Do you really want to delete this metadata definition? This process cannot be undone."
			actionBtnName="Delete"
			handleActionBtnClick={() => {
				deleteMetadataDefinition(metdataDefinitionId);
				setDeleteMetadataDefinitionConfirmOpen(false);
				history("/metadata-definitions");
			}}
			handleActionCancel={() => {
				setDeleteMetadataDefinitionConfirmOpen(false);
			}}
			actionLevel={"error"}
		/>
	);
}
