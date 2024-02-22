import React from "react";

type PublishedWrapperProps = {
	frozen: boolean | undefined;
	frozen_version_num: number | undefined;
	children: JSX.Element | JSX.Element[];
};

export const PublishedWrapper = (props: PublishedWrapperProps): JSX.Element => {
	const { frozen, frozen_version_num, children } = props;
	return (
		<>
			{frozen && frozen_version_num && frozen_version_num > 0 ? (
				<></>
			) : (
				children
			)}
		</>
	);
};
