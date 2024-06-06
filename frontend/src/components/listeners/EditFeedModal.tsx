import React, { useEffect, useState } from "react";
import { Container, Button, Box } from "@mui/material";
import feedSchema from "../../schema/feedSchema.json";
import { FormProps } from "@rjsf/core";
import { ClowderRjsfErrorList } from "../styledComponents/ClowderRjsfErrorList";
import Form from "@rjsf/mui";
import { useDispatch, useSelector } from "react-redux";
import { fetchListeners, updateFeed } from "../../actions/listeners";
import { RootState } from "../../types/data";
import validator from "@rjsf/validator-ajv8";

type EditFeedProps = {
	setEditFeedOpen: any;
	feed: any;
};

export const EditFeedModal = (props: EditFeedProps) => {
	const { setEditFeedOpen, feed } = props;

	const dispatch = useDispatch();
	const listListeners = () => dispatch(fetchListeners());
	const schema = feedSchema["schema"];
	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);
	const editFeed = (formData: FormData) =>
		dispatch(updateFeed(feed.id, formData));

	useEffect(() => {
		listListeners();
	}, []);

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
				validator={validator}
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
