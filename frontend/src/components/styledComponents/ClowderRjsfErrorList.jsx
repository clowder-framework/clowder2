import React from "react";
import { Alert } from "@mui/material";

export const ClowderRjsfErrorList = ({ errors }) => {
	return (
		<>
			{errors.map((error, index) => (
				<Alert severity="error" key={index}>
					{error.stack.replace(".", "")}
				</Alert>
			))}
		</>
	);
};
