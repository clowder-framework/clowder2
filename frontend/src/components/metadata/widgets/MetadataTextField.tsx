import React, { useState } from "react";
import { ClowderMetadataTextField } from "../../styledComponents/ClowderMetadataTextField";
import { MetadataEditButton } from "./MetadataEditButton";
import { Grid } from "@mui/material";
import { AuthWrapper } from "../../auth/AuthWrapper";
import { FrozenWrapper } from "../../auth/FrozenWrapper";

export const MetadataTextField = (props) => {
	const {
		widgetName,
		fieldName,
		content,
		setMetadata,
		metadataId,
		updateMetadata,
		resourceId,
		initialReadOnly,
		isRequired,
		datasetRole,
		frozen,
		frozenVersionNum,
	} = props;
	const [localContent, setLocalContent] = useState(
		content && content[fieldName] ? content : {}
	);
	const [readOnly, setReadOnly] = useState(initialReadOnly);
	const [inputChanged, setInputChanged] = useState(false);

	// Get the display value for read-only mode
	const getDisplayValue = () => {
		if (!readOnly) return null;

		// First check if content has the field
		if (content && content[fieldName] !== undefined && content[fieldName] !== null) {
			return content[fieldName];
		}

		// If not, check if localContent has it (for newly added fields)
		if (localContent && localContent[fieldName] !== undefined && localContent[fieldName] !== null) {
			return localContent[fieldName];
		}

		// If neither has the field, show "null"
		return "null";
	};

	// Get the value for the text field
	const getValue = () => {
		if (readOnly) {
			// Read-only mode: show content or "null"
			if (content && content[fieldName] !== undefined && content[fieldName] !== null) {
				return content[fieldName];
			}
			if (localContent && localContent[fieldName] !== undefined && localContent[fieldName] !== null) {
				return localContent[fieldName];
			}
			return "null";
		} else {
			// Edit mode: show localContent value (what user is typing)
			return localContent[fieldName] || "";
		}
	};


	return (
		<Grid container spacing={2} sx={{ alignItems: "center" }}>
			<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
				<ClowderMetadataTextField
					label={fieldName}
					variant="outlined"
					margin="normal"
					fullWidth
					name={widgetName}
					required={isRequired}
					value={getValue()}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setInputChanged(true);
						const tempContents: { [key: string]: string | number } = {};
						tempContents[fieldName] = event.target.value;
						setLocalContent(tempContents);
						setMetadata
							? metadataId
								? setMetadata({
										id: metadataId,
										definition: widgetName,
										content: tempContents,
								  })
								: setMetadata({
										definition: widgetName,
										content: tempContents,
								  })
							: null;
					}}
					disabled={readOnly}
					helperText={
						inputChanged
							? "* You have changed this field. Remember to save/ update."
							: ""
					}
				/>
			</Grid>
			<Grid item xs={1} sm={1} md={1} lg={1} xl={1}>
				<FrozenWrapper frozen={frozen} frozenVersionNum={frozenVersionNum}>
					<AuthWrapper
						currRole={datasetRole.role}
						allowedRoles={["owner", "editor", "uploader"]}
					>
						<MetadataEditButton
							readOnly={readOnly}
							setReadOnly={setReadOnly}
							updateMetadata={updateMetadata}
							content={localContent}
							metadataId={metadataId}
							resourceId={resourceId}
							widgetName={widgetName}
							setInputChanged={setInputChanged}
							setMetadata={setMetadata}
						/>
					</AuthWrapper>
				</FrozenWrapper>
			</Grid>
		</Grid>
	);
};
