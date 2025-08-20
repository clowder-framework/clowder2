import React from "react";
import { Select, MenuItem } from "@mui/material";
import { ClowderInputLabel } from "./ClowderInputLabel";

export const ClowderRjsfSelectWidget = (item) => {
	return (
		<>
			<ClowderInputLabel>{item.schema.title}</ClowderInputLabel>
			<Select
				labelId="label"
				id="select"
				variant="outlined"
				defaultValue={item.schema.enum[0]}
				onChange={(e) => {
					item.onChange(e.target.value);
				}}
			>
				{item.schema.enum.map((option, i) => {
					return (
						<MenuItem value={option} key={option}>
							{item.schema.enumNames
								? item.schema.enumNames[i]
								: item.schema.enum[i]}
						</MenuItem>
					);
				})}
			</Select>
		</>
	);
};
