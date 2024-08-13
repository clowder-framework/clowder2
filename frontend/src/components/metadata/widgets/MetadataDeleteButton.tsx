import React, { useState } from "react";
import { Button } from "@mui/material";
import { ActionModal } from "../../dialog/ActionModal";

type MetadataDeleteButtonType = {
	metadataId: string | undefined;
	deleteMetadata: any;
	resourceId: string | undefined;
	widgetName: string;
};

export const MetadataDeleteButton = (props: MetadataDeleteButtonType) => {
	const { metadataId, deleteMetadata, resourceId, widgetName } = props;
	const [confirmationOpen, setConfirmationOpen] = useState(false);

	return (
		<>
			{/*Confirmation dialogue*/}
			<ActionModal
				actionOpen={confirmationOpen}
				actionTitle="Are you sure?"
				actionText="Do you really want to delete this metadata? This process cannot be undone."
				actionBtnName="Delete"
				handleActionBtnClick={() => {
					deleteMetadata(resourceId, {
						id: metadataId,
						definition: widgetName,
					});
				}}
				handleActionCancel={() => {
					setConfirmationOpen(false);
				}}
				actionLevel={"error"}
			/>
			<Button
				variant="outlined"
				onClick={() => {
					setConfirmationOpen(true);
				}}
				sx={{ float: "right" }}
			>
				Delete
			</Button>
		</>
	);
};
