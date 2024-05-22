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

	const saveFeed = (formData: FormData) => {
		// console.log(formData);
		// console.log(formData.search);
		// // @ts-ignore
		// if (formData && formData.search != null && formData.search.criteria.length > 0)
		// 	{ // @ts-ignore
		// 		for (const criteria of formData.search.criteria){ // @ts-ignore
		// 							console.log("here")
		// 							criteria.operator = criteria.operator[0]
		// 						}
		// 	}
		dispatch(createFeed(formData));
	};
	useEffect(() => {
		listListeners();
	}, []);

	return (
		<Container>
			<Form
				schema={feedSchema["schema"] as FormProps<any>["schema"]}
				//uiSchema={licenseSchema["uiSchema"] as FormProps<any>["uiSchema"]}
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
