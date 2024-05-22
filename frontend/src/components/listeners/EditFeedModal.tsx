import React, { useState } from "react";
import { Container, Button, Box } from "@mui/material";
import feedSchema from "../../schema/feedSchema.json";
import { FormProps } from "@rjsf/core";
import { ClowderRjsfErrorList } from "../styledComponents/ClowderRjsfErrorList";
import Form from "@rjsf/material-ui";
import { useDispatch } from "react-redux";
import { updateFeed } from "../../actions/listeners";

type EditFeedProps = {
	setEditFeedOpen: any;
	feed: any;
};

export const EditFeedModal = (props: EditFeedProps) => {
	const { setEditFeedOpen, feed } = props;

	const dispatch = useDispatch();

	const editFeed = (formData: FormData) =>
		dispatch(updateFeed(feed.id, formData));

	return (
		<Container>
			<Form
				schema={feedSchema["schema"] as FormProps<any>["schema"]}
				//uiSchema={licenseSchema["uiSchema"] as FormProps<any>["uiSchema"]}
				formData={feed}
				onSubmit={({ formData }) => {
					editFeed(formData);
					// close modal
					setEditFeedOpen(false);
				}}
				ErrorList={ClowderRjsfErrorList}
			>
				<Box className="inputGroup" sx={{ float: "right" }}>
					<Button variant="contained" type="submit">
						Update
					</Button>
					<Button
						onClick={() => {
							setEditFeedOpen(false);
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
