import React, { useEffect, useState } from "react";
import { Container, Button, Box } from "@mui/material";
import feedSchema from "../../schema/feedSchema.json";
import { FormProps } from "@rjsf/core";
import { ClowderRjsfErrorList } from "../styledComponents/ClowderRjsfErrorList";
import Form from "@rjsf/material-ui";
import { useDispatch, useSelector } from "react-redux";
import { updateFeed } from "../../actions/listeners";
import { RootState } from "../../types/data";

type EditFeedProps = {
	setEditFeedOpen: any;
	feed: any;
};

export const EditFeedModal = (props: EditFeedProps) => {
	const { setEditFeedOpen, feed } = props;

	const dispatch = useDispatch();

	const schema = feedSchema["schema"];
	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);
	const editFeed = (formData: FormData) =>
		dispatch(updateFeed(feed.id, formData));

	useEffect(() => {
		const listenerNames: string[] = [];
		listeners?.map((listener) => (listenerNames[listener.id] = listener.name));
		// @ts-ignore
		schema.properties.listeners.items.properties.listener_id.enum =
			listeners?.map((listener) => listener.id);
		schema.properties.listeners.items.properties.listener_id.enumNames =
			schema.properties.listeners.items.properties.listener_id.enum.map(
				(id) => listenerNames[id]
			);
	}, [listeners]);

	return (
		<Container>
			<Form
				schema={feedSchema["schema"] as FormProps<any>["schema"]}
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
