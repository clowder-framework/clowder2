import * as React from "react";
import {InputLabel, MenuItem, FormControl} from "@mui/material";
import {useState} from "react";
import {ClowderMetadataSelect} from "../../styledComponents/ClowderMetadataSelect";
import {ClowderMetadataFormHelperText} from "../../styledComponents/ClowderMetadataFormHelperText";

export const MetadataSelect = (props) => {
	const {widgetName, metadataId, contents, setMetadata, initialReadOnly, options} = props;
	const [unit, setUnit] = React.useState(contents && contents.unit? contents.unit: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputChanged(true);
		setUnit(event.target.value);
		setMetadata ?
			metadataId?
				setMetadata({
					"id":metadataId,
					"definition": widgetName,
					"contents": {
						"unit":event.target.value,
					}
				})
				:
				setMetadata({
					"definition": widgetName,
					"contents": {
						"unit":event.target.value,
					}
				})
			:
			null
	};

	return (
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
	);
}
