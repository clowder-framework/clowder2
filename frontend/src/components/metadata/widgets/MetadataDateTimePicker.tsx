import React, { useState } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { ClowderMetadataTextField } from "../../styledComponents/ClowderMetadataTextField";
import { MetadataEditButton } from "./MetadataEditButton";
import { Grid } from "@mui/material";
import { AuthWrapper } from "../../auth/AuthWrapper";
import { FrozenWrapper } from "../../auth/FrozenWrapper";

export const MetadataDateTimePicker = (props) => {
	const {
		widgetName,
		fieldName,
		metadataId,
		content,
		setMetadata,
		initialReadOnly,
		resourceId,
		updateMetadata,
		datasetRole,
		frozen,
		frozenVersionNum,
	} = props;
	const [localContent, setLocalContent] = useState(
		content && content[fieldName] ? content : {}
	);

	const [readOnly, setReadOnly] = useState(initialReadOnly);

	const [inputChanged, setInputChanged] = useState(false);

	const handleChange = (newValue: Date) => {
		setInputChanged(true);

		const tempContents: { [key: string]: Date } = {};
		tempContents[fieldName] = newValue;
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
		setLocalContent(tempContents);
	};

	return (
		<div style={{ margin: "1.1em auto" }}>
			<Grid container spacing={2} sx={{ alignItems: "center" }}>
				<Grid item xs={11} sm={11} md={11} lg={11} xl={11}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
						<DateTimePicker
							label={widgetName}
							value={
								readOnly && content
									? content[fieldName]
									: localContent[fieldName]
							}
							onChange={handleChange}
							renderInput={(params) => (
								<ClowderMetadataTextField
									{...params}
									fullWidth
									helperText={
										inputChanged
											? "* You have changed this field. " +
											  "Remember to save/ update."
											: ""
									}
								/>
							)}
							disabled={readOnly}
						/>
					</LocalizationProvider>
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
		</div>
	);
};
