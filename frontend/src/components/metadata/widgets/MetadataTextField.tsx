import React, {useState} from "react";
import { ClowderMetadataTextField } from "../../styledComponents/ClowderMetadataTextField";

export const MetadataTextField = (props) => {
	const {widgetName, contents, setMetadata, metadataId,
		initialReadOnly} = props;
	const [text, setText] = useState(contents && contents.alternateName ? contents.alternateName: "");

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	return (
		<ClowderMetadataTextField label={widgetName} variant="outlined" margin="normal" fullWidth name={widgetName}
			  value={readOnly && contents? contents.alternateName: text}
			  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
				  setInputChanged(true);
				  setText(event.target.value);
				  setMetadata ?
					  metadataId ?
						  setMetadata({
							  "id":metadataId,
							  "definition": widgetName,
							  "contents": {
								  "alternateName":event.target.value,
							  }
						  })
						  :
						  setMetadata({
							  "definition": widgetName,
							  "contents": {
								  "alternateName":event.target.value,
							  }
						  })
					  :
					  null
			  }}
			  disabled={readOnly}
			  helperText={inputChanged? "* You have changed this field. Remember to save/ update.": ""}
			/>
	)
}
