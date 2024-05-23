import React, { useEffect, useState } from "react";
import { Container, Button, Box } from "@mui/material";
import feedSchema from "../../schema/feedSchema.json";
import { FormProps } from "@rjsf/core";
import { ClowderRjsfErrorList } from "../styledComponents/ClowderRjsfErrorList";
import Form from "@rjsf/material-ui";
import { useDispatch, useSelector } from "react-redux";
import { createFeed, fetchListeners } from "../../actions/listeners";
import { RootState } from "../../types/data";
import List from "@mui/material/List";

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
		console.log(formData);
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
				onSubmit={({ formData }) => {
					saveFeed(formData);
					// close modal
					setCreateFeedOpen(false);
				}}
				ErrorList={ClowderRjsfErrorList}
			>
				{/*<List>*/}
				{/*	{listeners !== undefined ? (*/}
				{/*				listeners.map((listener) => {*/}
				{/*					return (*/}
				{/*						<span>{listener.name}*/}
				{/*						</span>*/}
				{/*						)})): <></>}*/}
				{/*</List>*/}
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
