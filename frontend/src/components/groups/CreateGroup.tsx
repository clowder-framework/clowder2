import React, { useEffect } from "react";

import { Box, Button, Container } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Form from "@rjsf/mui";
import { FormProps } from "@rjsf/core";
import {
	createGroup as createGroupAction,
	resetGroupCreation,
} from "../../actions/group";
import { ClowderRjsfTextWidget } from "../styledComponents/ClowderRjsfTextWidget";
import { ClowderRjsfSelectWidget } from "../styledComponents/ClowderRjsfSelectWidget";
import groupSchema from "../../schema/groupSchema.json";
import { ClowderRjsfTextAreaWidget } from "../styledComponents/ClowderRjsfTextAreaWidget";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../types/data";
import validator from "@rjsf/validator-ajv8";

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
	const history = useNavigate();

	const createGroup = (formData: FormData) =>
		dispatch(createGroupAction(formData));

	const newGroup = useSelector((state: RootState) => state.group.newGroup);

	useEffect(() => {
		if (newGroup.id) {
			//reset group so next creation can be done
			dispatch(resetGroupCreation());
			// zoom into that newly created dataset
			history(`/groups/${newGroup.id}`);
		}
	}, [newGroup]);

	return (
		<Container>
			<Form
				widgets={widgets}
				schema={groupSchema["schema"] as FormProps<any>["schema"]}
				uiSchema={groupSchema["uiSchema"] as FormProps<any>["uiSchema"]}
				validator={validator}
				onSubmit={({ formData }) => {
					createGroup(formData);
					// close modal
					setCreateGroupOpen(false);
				}}
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
