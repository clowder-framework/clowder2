import React from "react";
import {Box, Button} from "@mui/material";

type MetadataEditButtonType = {
	readOnly: boolean,
	setReadOnly: any,
	updateMetadata: any,
	contents: object,
	metadataId: string|undefined,
	resourceId: string|undefined,
	widgetName: string,
	setInputChanged: any,
	setMetadata: any,
}

export const MetadataEditButton = (props: MetadataEditButtonType) => {

	const {readOnly, setReadOnly, metadataId, updateMetadata, setMetadata,
		resourceId, contents, widgetName, setInputChanged} = props;

	return (
		<>
			{
				readOnly ?
					<Box sx={{textAlign: "right"}}>
						<Button variant="text" onClick={() => {setReadOnly(false);}}>Edit</Button>
					</Box>
					:
					<Box sx={{textAlign: "right"}}>
						{ metadataId ?
							// if setMetadata exist; don't show the individual update button;
							// will update all metadata at form level
							setMetadata ?
								<></>
								:
								<>
									<Button variant="text" onClick={() => {
										setReadOnly(true);
										setInputChanged(false);
									}}>Cancel</Button>
									<Button variant="contained" onClick={() => {
										// update metadata
										updateMetadata(resourceId, {
											"id":metadataId,
											"definition": widgetName,
											"contents": contents
										});
										setReadOnly(true);
										setInputChanged(false);
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
