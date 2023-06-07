import React from "react";
import { ClowderInput } from "./ClowderInput";
import { ClowderInputLabel } from "./ClowderInputLabel";

export const ClowderRjsfTextAreaWidget = (item) => {
	return (
		<>
			<ClowderInputLabel>{item.schema.title}</ClowderInputLabel>
			<ClowderInput
				multiline
				value={item.value}
				variant="outlined"
				onChange={(e) => {
					item.onChange(e.target.value);
				}}
				rows={4}
			/>
		</>
	);
};
