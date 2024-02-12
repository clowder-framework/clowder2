import { Box } from "@material-ui/core";
import React from "react";
import { ClowderInput } from "./ClowderInput";
import { ClowderInputLabel } from "./ClowderInputLabel";

export const ClowderRjsfTextWidget = (item) => {
	return (
		<>
			<ClowderInputLabel>{item.schema.title}</ClowderInputLabel>
			<ClowderInput
				value={item.value}
				variant="outlined"
				onChange={(e) => {
					item.onChange(e.target.value);
				}}
			/>
		</>
	);
};
