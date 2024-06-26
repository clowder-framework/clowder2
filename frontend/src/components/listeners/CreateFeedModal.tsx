import React, { useEffect } from "react";
import { Container, Button, Box } from "@mui/material";
import feedSchema from "../../schema/feedSchema.json";
import { FormProps } from "@rjsf/core";
import Form from "@rjsf/mui";
import { useDispatch, useSelector } from "react-redux";
import { createFeed, fetchListeners } from "../../actions/listeners";
import { RootState } from "../../types/data";
import validator from "@rjsf/validator-ajv8";

type CreateFeedProps = {
	setCreateFeedOpen: any;
};

export const CreateFeedModal = (props: CreateFeedProps) => {
	const { setCreateFeedOpen } = props;

	const dispatch = useDispatch();
	const listListeners = () => dispatch(fetchListeners());
	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);
	const schema = feedSchema["schema"];

	const saveFeed = (formData: FormData) => {
		dispatch(createFeed(formData));
	};
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
				schema={schema as FormProps<any>["schema"]}
				validator={validator}
				onSubmit={({ formData }) => {
					saveFeed(formData);
					// close modal
					setCreateFeedOpen(false);
				}}
			>
				<Box className="inputGroup" sx={{ float: "right" }}>
					<Button variant="contained" type="submit">
						Save
					</Button>
					<Button
						onClick={() => {
							setCreateFeedOpen(false);
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
