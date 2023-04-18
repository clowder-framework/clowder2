import React from "react";

import { Box, Button, Container } from "@mui/material";
import { useDispatch } from "react-redux";
import Form from "@rjsf/material-ui";
import { FormProps } from "@rjsf/core";
import { createGroup as createGroupAction } from "../../actions/group";
import { ClowderRjsfTextWidget } from "../styledComponents/ClowderRjsfTextWidget";
import { ClowderRjsfSelectWidget } from "../styledComponents/ClowderRjsfSelectWidget";
import { groupSchema } from "../../schema/groupSchema.json";

const widgets = {
	TextWidget: ClowderRjsfTextWidget,
	SelectWidget: ClowderRjsfSelectWidget,
};

export const CreateGroup = (): JSX.Element => {
	const dispatch = useDispatch();

	const createGroup = (formData: FormData) =>
		dispatch(createGroupAction(formData));

	return (
		<Container>
			<Form
				widgets={widgets}
				schema={groupSchema["schema"] as FormProps<any>["schema"]}
				uiSchema={groupSchema["uiSchema"] as FormProps<any>["uiSchema"]}
				onSubmit={({ formData }) => {
					createGroup(formData);
				}}
			>
				<Box className="inputGroup">
					<Button
						variant="contained"
						type="submit"
						className="form-button-block"
					>
						Create
					</Button>
				</Box>
			</Form>
		</Container>
	);
};
