import React from "react";
import {Button} from "@mui/material";


export const MetadataButtonGroup = (props) => {

	const {readOnly, setReadOnly, metadataId, updateMetadata, deleteMetadata, saveMetadata, resourceId, contents, widgetName} = props;

	return (
		<>
		{
			readOnly ?
				<>
					{/*<Button variant="text" sx={{float:"right"}} onClick={() => {deleteMetadata(resourceId);}}>Delete</Button>*/}
					<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(false);}}>Edit</Button>
				</>
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
							<Button variant="contained" sx={{float:"right"}} onClick={() => {
								// update metadata
								deleteMetadata(resourceId, {
									"id":metadataId,
									"definition": widgetName});
							}}>Delete</Button>
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
