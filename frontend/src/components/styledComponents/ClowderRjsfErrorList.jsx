import React from "react";

export const ClowderRjsfErrorList = ({ errors }) => {
	return (
		<div>
			{errors.map((error, index) => (
				<div key={index}>{error.stack.replace(".", "")}</div>
			))}
		</div>
	);
};
