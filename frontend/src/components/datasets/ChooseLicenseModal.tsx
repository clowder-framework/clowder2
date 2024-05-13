import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	Link,
} from "@mui/material";
import { V2 } from "../../openapi";
import { LicenseOption } from "../../openapi/v2";
import { CreateLicenseModal } from "./CreateLicenseModal";
import { fetchStandardLicenses } from "../../utils/licenses";
import Typography from "@mui/material/Typography";

type ChooseLicenseModalProps = {
	selectedLicense: any;
	setSelectedLicense: any;
	setLicenseRequestForm: any;
	handleBack: any;
	handleNext: any;
};

export const ChooseLicenseModal: React.FC<ChooseLicenseModalProps> = (
	props: ChooseLicenseModalProps
) => {
	const {
		selectedLicense,
		setSelectedLicense,
		setLicenseRequestForm,
		handleBack,
		handleNext,
	} = props;
	const [standardLicenses, setStandardLicenses] = useState<LicenseOption[]>([]);
	const [licenseModalOpen, setLicenseModalOpen] = useState<boolean>(false);
	const fetchStandardLicensesData = async () => {
		try {
			const data = await fetchStandardLicenses(); // Call your function to fetch licenses
			setStandardLicenses(data); // Update state with the fetched data
		} catch (error) {
			console.error("Error fetching licenses", error);
		}
	};

	useEffect(() => {
		fetchStandardLicensesData();
	}, []);

	useEffect(() => {
		setSelectedLicense();
	}, []);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedLicense(event.target.id);
		if (event.target.id == "Custom") setLicenseModalOpen(true);
		else setLicenseRequestForm(null);
	};

	const handleCloseModal = () => {
		setLicenseModalOpen(false);
		setSelectedLicense(null); // Reset selected license
	};

	// @ts-ignore
	return (
		<FormControl component="fieldset">
			{standardLicenses.map((license) => (
				<div className="license-item">
					<div className="radio-checkbox">
						<input
							type="radio"
							id={license.id}
							name="license"
							value={license.url}
							onChange={handleChange}
							checked={selectedLicense === license.id}
						/>
					</div>
					<div>
						<div>
							{license.url && (
								<Link
									href={license.url}
									target="_blank"
									rel="noopener noreferrer"
									sx={{ textDecoration: "none" }}
								>
									<img
										className="logo"
										src={`public/${license.id}.png`}
										alt={`${license.id}`}
									/>
								</Link>
							)}
							{!license.url && <Typography>{license.id}</Typography>}
						</div>
						<div className="description">
							{license.description.split("\n").map((line, index) => (
								<React.Fragment key={index}>
									{index > 0 ? <li>{line}</li> : line}
									<br />
								</React.Fragment>
							))}
						</div>
					</div>
				</div>
			))}
			<Dialog
				open={licenseModalOpen}
				onClose={handleCloseModal}
				fullWidth={true}
				maxWidth="md"
				aria-labelledby="form-dialog"
			>
				<DialogTitle>Create custom license</DialogTitle>
				<DialogContent>
					<CreateLicenseModal
						setLicenseModalOpen={setLicenseModalOpen}
						setLicenseRequestForm={setLicenseRequestForm}
						handleNext={handleNext}
						handleCloseModal={handleCloseModal}
					/>
				</DialogContent>
			</Dialog>
			<Box>
				<Button
					disabled={!selectedLicense}
					variant="contained"
					onClick={handleNext}
				>
					Next
				</Button>
				<Button onClick={handleBack} sx={{ mt: 1, ml: 1 }}>
					Back
				</Button>
			</Box>
		</FormControl>
	);
};
