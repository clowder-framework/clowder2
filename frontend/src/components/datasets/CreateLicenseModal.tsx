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
import Form from "@rjsf/material-ui";
import { V2 } from "../../openapi"; // Import LicenseOut type

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
				onSubmit={({ formData }) => {
					addLicense(formData);
					// close modal
					setLicenseModalOpen(false);
				}}
				ErrorList={ClowderRjsfErrorList}
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
