import React, { useEffect, useState } from "react";
import {
	Box,
	Button, Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	Link
} from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import { V2 } from "../../openapi";
import { LicenseOption } from "../../openapi/v2";
import {CreateLicenseModal} from "./CreateLicenseModal";

type ChooseLicenseModalProps = {
	selectedLicense: any;
  setSelectedLicense: any;
  setLicenseRequestForm: any;
  handleBack: any;
  handleNext: any
};

export const ChooseLicenseModal: React.FC<ChooseLicenseModalProps> = (
	props: ChooseLicenseModalProps
) => {
	const { selectedLicense, setSelectedLicense, setLicenseRequestForm, handleBack, handleNext } = props;
	const [standardLicenses, setStandardLicenses] = useState<LicenseOption[]>([]);
	const [licenseModalOpen, setLicenseModalOpen] = useState<boolean>(false);

	useEffect(() => {
		V2.LicensesService.getLicensesApiV2LicensesGet()
			.then((response) => setStandardLicenses(response))
			.catch((error) => console.error("Error fetching licenses:", error));
	}, []);

	useEffect(() => {
		setSelectedLicense();
	}, []);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedLicense(event.target.id);
	  if (event.target.id == "Custom")
		  setLicenseModalOpen(true);
	  else
		  setLicenseRequestForm(null);
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
							<Link href={license.url} target="_blank" rel="noopener noreferrer"
								  sx={{textDecoration: "none"}}>
								<img className="logo" src={`styles/images/${license.id}.png`} alt={`${license.id}`}/>
							</Link>
						</div>
						<div className="description">
							{license.description.split("\n").map((line, index) => (
								<React.Fragment key={index}>
									{index > 0 ? <li>{line}</li> : line}
									<br/>
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
					<CreateLicenseModal setLicenseModalOpen={setLicenseModalOpen}
										setLicenseRequestForm={setLicenseRequestForm} handleNext={handleNext}/>
				</DialogContent>
			</Dialog>
			<Box>
				<Button variant="contained" onClick={handleNext}>
					Next
				</Button>
				<Button onClick={handleBack} sx={{mt: 1, ml: 1}}>
				Back
				</Button>
			</Box>
		</FormControl>
	);
};
