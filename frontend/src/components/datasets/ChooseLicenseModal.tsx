import React, { useEffect, useState } from "react";
import {Box, Button, FormControl, FormControlLabel, Link, Radio, RadioGroup} from "@mui/material";
import { V2 } from "../../openapi";
import { LicenseOption } from "../../openapi/v2";

type ChooseLicenseModalProps = {
  setSelectedLicense: any;
  handleBack: any;
  handleNext: any
};

export const ChooseLicenseModal: React.FC<ChooseLicenseModalProps> = (
  props: ChooseLicenseModalProps
) => {
  const { setSelectedLicense, handleBack, handleNext } = props;
  const [standardLicenses, setStandardLicenses] = useState<LicenseOption[]>([]);

  useEffect(() => {
    V2.LicensesService.getLicensesApiV2LicensesGet()
      .then((response) => setStandardLicenses(response))
      .catch((error) => console.error("Error fetching licenses:", error));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedLicense(event.target.id);
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
					/>
				</div>
				<div>
					<Link href={license.url} target="_blank" rel="noopener noreferrer" sx={{textDecoration: 'none'}}>
						<div className="header">{license.id}</div>
					</Link>
					<div className="description">
						{license.description.split('\n').map((line, index) => (
							<React.Fragment key={index}>
								{line}
								<br/>
							</React.Fragment>
						))}
					</div>
				</div>
			</div>
		))}
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
