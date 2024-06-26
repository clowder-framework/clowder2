import React, { useState } from "react";
import {
	Container,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
} from "@mui/material";
import licenseSchema from "../../schema/licenseSchema.json";
import { FormProps } from "@rjsf/core";
import { ClowderRjsfErrorList } from "../styledComponents/ClowderRjsfErrorList";
import Form from "@rjsf/mui";
import { V2 } from "../../openapi";
import validator from "@rjsf/validator-ajv8";

type CreateLicenseModalProps = {
	setLicenseModalOpen: any;
	setLicenseRequestForm: any;
	handleNext: any;
	handleCloseModal: any;
};

export const CreateLicenseModal = (props: CreateLicenseModalProps) => {
	const {
		setLicenseModalOpen,
		setLicenseRequestForm,
		handleNext,
		handleCloseModal,
	} = props;

	const addLicense = (formData: FormData) => {
		setLicenseRequestForm(formData);
		handleNext();
	};

	return (
		<Container>
			<Form
				schema={licenseSchema["schema"] as FormProps<any>["schema"]}
				validator={validator}
				onSubmit={({ formData }) => {
					addLicense(formData);
					// close modal
					setLicenseModalOpen(false);
				}}
			>
				<Box className="inputGroup" sx={{ float: "right" }}>
					<Button variant="contained" type="submit">
						Add
					</Button>
					<Button
						onClick={() => {
							handleCloseModal();
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
