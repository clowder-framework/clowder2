import React from "react";

type FrozenWrapperProps = {
	frozen: boolean | undefined;
	frozenVersionNum: number | undefined;
	children: JSX.Element | JSX.Element[];
};

export const FrozenWrapper = (props: FrozenWrapperProps): JSX.Element => {
	const { frozen, frozenVersionNum, children } = props;
	return (
		<>{frozen && frozenVersionNum && frozenVersionNum > 0 ? <></> : children}</>
	);
};
