import React from "react";

import { Box, Button, Container } from "@mui/material";
import { useDispatch } from "react-redux";
import Form from "@rjsf/material-ui";
import { FormProps } from "@rjsf/core";
import { createGroup as createGroupAction } from "../../actions/group";
import { ClowderRjsfTextWidget } from "../styledComponents/ClowderRjsfTextWidget";
import { ClowderRjsfSelectWidget } from "../styledComponents/ClowderRjsfSelectWidget";
import groupSchema from "../../schema/groupSchema.json";
import { ClowderRjsfTextAreaWidget } from "../styledComponents/ClowderRjsfTextAreaWidget";
import { ClowderRjsfErrorList } from "../styledComponents/ClowderRjsfErrorList";

const widgets = {
	TextWidget: ClowderRjsfTextWidget,
	TextAreaWidget: ClowderRjsfTextAreaWidget,
	SelectWidget: ClowderRjsfSelectWidget,
};

type CreateGroupProps = {
	setCreateGroupOpen: any;
};

export const CreateGroup = (props: CreateGroupProps): JSX.Element => {
	const { setCreateGroupOpen } = props;

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
					// close modal
					setCreateGroupOpen(false);
				}}
				ErrorList={ClowderRjsfErrorList}
			>
				<Box className="inputGroup" sx={{ float: "right" }}>
					<Button variant="contained" type="submit">
						Create
					</Button>
					<Button
						onClick={() => {
							setCreateGroupOpen(false);
						}}
						sx={{ marginLeft: "0.5em" }}
					>
						Cancel
					</Button>
				</Box>
			</Form>
		</Container>
	);
};
