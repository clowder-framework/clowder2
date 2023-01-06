import React, {useState} from "react";
import { ClowderMetadataTextField } from "../../styledComponents/ClowderMetadataTextField";
import { MetadataEditButton } from "./MetadataEditButton";
import {Grid} from "@mui/material";

export const MetadataTextField = (props) => {
	const {widgetName, fieldName, contents, setMetadata, metadataId, updateMetadata, resourceId, initialReadOnly, isRequired} = props;
	const [localContent, setLocalContent] = useState(contents && contents[fieldName] ? contents: {});

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	return (
		<Grid container spacing={2} sx={{ "alignItems": "center"}}>
			<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
				<ClowderMetadataTextField label={fieldName} variant="outlined" margin="normal" fullWidth name={widgetName} required={isRequired}
										  value={readOnly && contents? contents[fieldName]: localContent[fieldName]}
										  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
											  setInputChanged(true);
											  let tempContents: { [key: string]: string|number; } = {};
											  tempContents[fieldName] = event.target.value;
											  setLocalContent(tempContents)
											  setMetadata ?
												  metadataId ?
													  setMetadata({
														  "id":metadataId,
														  "definition": widgetName,
														  "content": tempContents
													  })
													  :
													  setMetadata({
														  "definition": widgetName,
														  "content": tempContents
													  })
												  :
												  null
										  }}
										  disabled={readOnly}
										  helperText={inputChanged? "* You have changed this field. Remember to save/ update.": ""}
				/>
			</Grid>
			<Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
				<MetadataEditButton readOnly={readOnly} setReadOnly={setReadOnly} updateMetadata={updateMetadata}
									content={localContent} metadataId={metadataId} resourceId={resourceId}
									widgetName={widgetName} setInputChanged={setInputChanged}
									setMetadata={setMetadata}
				/>
			</Grid>
		</Grid>
	)
}
