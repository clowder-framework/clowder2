import * as React from "react";
import {InputLabel, MenuItem, FormControl, Grid} from "@mui/material";
import {useState} from "react";
import {ClowderMetadataSelect} from "../../styledComponents/ClowderMetadataSelect";
import {ClowderMetadataFormHelperText} from "../../styledComponents/ClowderMetadataFormHelperText";
import {MetadataEditButton} from "./MetadataEditButton";

export const MetadataSelect = (props) => {
	const {widgetName, fieldName, metadataId, contents, setMetadata, initialReadOnly, options, resourceId,
		updateMetadata} = props;
	const [localContent, setLocalContent] = useState(contents && contents[fieldName] ? contents: {});

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputChanged(true);
		let tempContents: { [key: string]: string; } = {};
		tempContents[fieldName] = event.target.value;
		setMetadata ?
			metadataId ?
				setMetadata({
					"id":metadataId,
					"definition": widgetName,
					"contents": tempContents
				})
				:
				setMetadata({
					"definition": widgetName,
					"contents": tempContents
				})
			:
			null
		setLocalContent(tempContents)
	};

	return (
		<div style={{margin:"1em auto"}}>
			<Grid container spacing={2} sx={{ "alignItems": "center"}}>
				<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
					<FormControl fullWidth>
						<InputLabel>{widgetName}</InputLabel>
						<ClowderMetadataSelect value={readOnly && contents ? contents[fieldName]: localContent[fieldName]}
											   label="Unit" onChange={handleChange}
											   sx={{background:"#ffffff"}}
											   disabled={readOnly}
						>
							{
								options.map((option) => {
									return <MenuItem value={option}>{option}</MenuItem>
								})
							}
						</ClowderMetadataSelect>
						<ClowderMetadataFormHelperText>{inputChanged? "* You have changed this field. Remember to save/ update.": ""}
						</ClowderMetadataFormHelperText>
					</FormControl>
				</Grid>
				<Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
					<MetadataEditButton readOnly={readOnly} setReadOnly={setReadOnly} updateMetadata={updateMetadata}
										contents={localContent} metadataId={metadataId} resourceId={resourceId}
										widgetName={widgetName} setInputChanged={setInputChanged}
										setMetadata={setMetadata}/>
				</Grid>
			</Grid>
		</div>
	);
}
