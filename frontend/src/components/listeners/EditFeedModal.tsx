import React, { useEffect, useState } from "react";
import { Container, Button, Box } from "@mui/material";
import feedSchema from "../../schema/feedSchema.json";
import { FormProps } from "@rjsf/core";
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
	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);
	const [schema, setSchema] = useState(feedSchema["schema"]);
	const [loading, setLoading] = useState(true);

	const editFeed = (formData: FormData) =>
		dispatch(updateFeed(feed.id, formData));

	useEffect(() => {
		listListeners();
	}, []);

	useEffect(() => {
		const listenerNames: string[] = [];
		listeners?.map((listener) => (listenerNames[listener.id] = listener.name));
		// @ts-ignore
		const updatedSchema = { ...schema };
		updatedSchema.properties.listeners.items.properties.listener_id.enum =
			listeners?.map((listener) => listener.id);
		updatedSchema.properties.listeners.items.properties.listener_id.enumNames =
			schema.properties.listeners.items.properties.listener_id.enum.map(
				(id) => listenerNames[id]
			);
		setSchema(updatedSchema);
		setLoading(false);
	}, [listeners, schema.properties.listeners]);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<Container>
			<Form
				schema={feedSchema["schema"] as FormProps<any>["schema"]}
				validator={validator}
				formData={feed}
				onSubmit={({ formData }) => {
					editFeed(formData);
					// close modal
					setEditFeedOpen(false);
				}}
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
