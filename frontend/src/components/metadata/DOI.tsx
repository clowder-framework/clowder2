import React, {useEffect, useState} from "react";
import {MetadataButtonGroup} from "./MetadataButtonGroup";
import { ClowderMetadataTextField } from "../styledComponents/ClowderMetadataTextField";

export const DOI = (props) => {
	const {widgetName, metadataId, contents, updateMetadata, setMetadata, deleteMetadata, resourceId, initialReadOnly} = props;
	const [DOI, setDOI] = useState(contents && contents.doi ? contents.doi: "");
	const [promptError, setPromptError] = useState(false);
	const DOIErrorText = "DOI must follow the format of doi:0000000/000000000000!";

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	useEffect(() => {
		// If DOI doesn't follow the format (Regex)
		if (DOI !== ""){
			if (!/doi:[0-9]{7}\/[0-9]{12}/.test(DOI)){
				setPromptError(true);
			}
			else{
				setPromptError(false);
			}
		}
	}, [DOI]);
	return (
		<>
			<ClowderMetadataTextField label={widgetName} variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly && contents ? contents.doi: DOI}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					   		setDOI(event.target.value);
					   		setMetadata ?
								metadataId ?
									setMetadata({
										"id": metadataId,
										"definition": widgetName,
										"contents": {
										   "doi":event.target.value,
										}
									})
									:
									setMetadata({
										"definition": widgetName,
										"contents": {
											"doi":event.target.value,
										}
									})
								:
								null
					   }}
					   error={promptError}
					   helperText={DOIErrorText}
					   disabled={readOnly}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 setMetadata={setMetadata}
								 updateMetadata={updateMetadata}
								 deleteMetadata={deleteMetadata}
								 resourceId={resourceId}
								 contents={{"doi":DOI}}
								 widgetName={widgetName}
			/>
		</>

	)
}
