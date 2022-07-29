import * as React from "react";
import {InputLabel, MenuItem, FormControl} from "@mui/material";
import {useState} from "react";
import {ClowderMetadataSelect} from "../../styledComponents/ClowderMetadataSelect";
import {ClowderMetadataFormHelperText} from "../../styledComponents/ClowderMetadataFormHelperText";
import {MetadataEditButton} from "./MetadataEditButton";

export const MetadataSelect = (props) => {
	const {widgetName, fieldName, metadataId, contents, setMetadata, initialReadOnly, options, resourceId,
		updateMetadata} = props;
	const [unit, setUnit] = React.useState(contents && contents.unit? contents.unit: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputChanged(true);
		setUnit(event.target.value);

		let contents: { [key: string]: string; } = {};
		contents[fieldName] = event.target.value;
		setMetadata ?
			metadataId ?
				setMetadata({
					"id":metadataId,
					"definition": widgetName,
					"contents": contents
				})
				:
				setMetadata({
					"definition": widgetName,
					"contents": contents
				})
			:
			null
	};

	return (
		<div style={{margin: "1em auto"}}>
			<FormControl fullWidth>
				<InputLabel>{widgetName}</InputLabel>
				<ClowderMetadataSelect value={readOnly && contents ? contents.unit: unit}
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
			<MetadataEditButton readOnly={readOnly} setReadOnly={setReadOnly} updateMetadata={updateMetadata}
								contents={contents} metadataId={metadataId} resourceId={resourceId}
								widgetName={widgetName} setInputChanged={setInputChanged}
								setMetadata={setMetadata}/>
		</div>
	);
}
