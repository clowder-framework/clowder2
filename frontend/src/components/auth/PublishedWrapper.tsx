import React from "react";

type PublishedWrapperProps = {
	frozen: boolean | undefined;
	frozenVersionNum: number | undefined;
	children: JSX.Element | JSX.Element[];
};

export const PublishedWrapper = (props: PublishedWrapperProps): JSX.Element => {
	const { frozen, frozenVersionNum, children } = props;
	return (
		<>{frozen && frozenVersionNum && frozenVersionNum > 0 ? <></> : children}</>
	);
};
