import React, {useState} from "react";
import {Box, Button} from "@mui/material";
import {ActionModal} from "../dialog/ActionModal";


export const MetadataButtonGroup = (props) => {

	const {readOnly, setReadOnly, metadataId, updateMetadata, deleteMetadata, saveMetadata, resourceId, contents, widgetName} = props;
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
				<>
					{ metadataId ?
						<>
							{/*Patch*/}
							<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(true);}}>Cancel</Button>
							<Button variant="contained" sx={{float:"right"}} onClick={() => {
								// update metadata
								updateMetadata(resourceId, {
									"id":metadataId,
									"definition": widgetName,
									"contents": contents});
								setReadOnly(true);
							}}>Update</Button>
						</>
						:
						<>
							{/*{Create}*/}
							{/*TODO need to rewrite the post body of creating a new metadata*/}
							<Button variant="contained" sx={{float:"right"}} onClick={() => {
								// save the form info and in parent component create metadata
								saveMetadata({
									"definition": widgetName,
									"contents": contents
								});
								setReadOnly(true);
							}}>Create</Button>
						</>
					}
				</>
		}
		</>
	);
}
