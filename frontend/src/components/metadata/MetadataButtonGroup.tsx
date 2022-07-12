import React, {useState} from "react";
import {Box, Button} from "@mui/material";
import {ActionModal} from "../dialog/ActionModal";


export const MetadataButtonGroup = (props) => {

	const {readOnly, setReadOnly, metadataId, updateMetadata, deleteMetadata, resourceId, contents, widgetName} = props;
	const [confirmationOpen, setConfirmationOpen] = useState(false);

	return (
		<>
			{/*Confirmation dialogue*/}
			<ActionModal actionOpen={confirmationOpen} actionTitle="Are you sure?"
						 actionText="Do you really want to delete? This process cannot be undone."
						 actionBtnName="Delete"
						 handleActionBtnClick={() => {
							 deleteMetadata(resourceId, {
								 "id":metadataId,
								 "definition": widgetName});
						 }}
						 handleActionCancel={() => {
							 setConfirmationOpen(false);
						 }}
			/>
		{
			readOnly ?
				<Box sx={{textAlign: "right"}}>
					<Button variant="text" onClick={() => {setReadOnly(false);}}>Edit</Button>
					{
						deleteMetadata ?
							<Button variant="text" onClick={() => {setConfirmationOpen(true);}}>
								Delete</Button>
							:
							<></>
					}
				</Box>
				:
				<Box sx={{textAlign: "right"}}>
					{ metadataId ?
						<>
							{/*Patch*/}
							<Button variant="text" onClick={() => {setReadOnly(true);}}>Cancel</Button>
							<Button variant="contained" onClick={() => {
								// update metadata
								updateMetadata(resourceId, {
									"id":metadataId,
									"definition": widgetName,
									"contents": contents});
								setReadOnly(true);
							}}>Update</Button>
						</>
						:
						<></>
					}
				</Box>
		}
		</>
	);
}
