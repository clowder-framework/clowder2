import React from "react";
import {Button} from "@mui/material";

export const MetadataButtonGroup = (props) => {

	const {readOnly, setReadOnly, metadataId, saveMetadata, resourceId, contents, resetForm, widgetName} = props;

	return (
		<>
		{
			readOnly ?
				<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(false);}}>Edit</Button>
				:
				<>
					{ metadataId ?
						<>
							{/*Patch*/}
							<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(true);}}>Cancel</Button>
							<Button variant="contained" sx={{float:"right"}} onClick={() => {
								// update metadata
								saveMetadata(resourceId, {
									"id":metadataId,
									"definition": widgetName,
									"contents": contents});
								resetForm();
								setReadOnly(true);
							}}>Update</Button>
						</>
						:
						<>
							{/*/!*{Create}*!/*/}
							{/*/!*TODO need to rewrite the post body of creating a new metadata*!/*/}
							{/*<Button variant="contained" sx={{float:"right"}} onClick={() => {*/}
							{/*	saveMetadata(resourceId, {*/}
							{/*		"id":metadataId,*/}
							{/*		"definition": widgetName,*/}
							{/*		"contents": contents});*/}
							{/*	resetForm();*/}
							{/*	setReadOnly(true);*/}
							{/*}}>Create</Button>*/}
						</>
					}
				</>
		}
		</>
	);
}
