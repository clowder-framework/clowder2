import React from "react";
import { frozenCheck } from "../../utils/common";

type FrozenWrapperProps = {
	frozen: boolean | undefined;
	frozenVersionNum: number | undefined;
	children: JSX.Element | JSX.Element[];
};

export const FrozenWrapper = (props: FrozenWrapperProps): JSX.Element => {
	const { frozen, frozenVersionNum, children } = props;
	return <>{frozenCheck(frozen, frozenVersionNum) ? <></> : children}</>;
};
