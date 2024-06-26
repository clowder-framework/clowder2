import React, { useState } from "react";
import {
	Container,
	Dialog,
	DialogContent,
	DialogTitle,
	Button,
	Box,
} from "@mui/material";
import licenseSchema from "../../schema/licenseSchema.json";
import { FormProps } from "@rjsf/core";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { updateDatasetLicense } from "../../actions/dataset"; // Import LicenseOut type

type EditLicenseModalProps = {
	setEditLicenseOpen: any;
};

export const EditLicenseModal = (props: EditLicenseModalProps) => {
	const { setEditLicenseOpen } = props;

	const dispatch = useDispatch();

	const editLicense = (formData: FormData) =>
		dispatch(updateDatasetLicense(license.id, formData));

	const license = useSelector((state: RootState) => state.dataset.license);

	return (
		<Container>
			<Form
				schema={licenseSchema["schema"] as FormProps<any>["schema"]}
				//uiSchema={licenseSchema["uiSchema"] as FormProps<any>["uiSchema"]}
				formData={license}
				validator={validator}
				onSubmit={({ formData }) => {
					editLicense(formData);
					// close modal
					setEditLicenseOpen(false);
				}}
			>
				<Box className="inputGroup" sx={{ float: "right" }}>
					<Button variant="contained" type="submit">
						Update
					</Button>
					<Button
						onClick={() => {
							setEditLicenseOpen(false);
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
