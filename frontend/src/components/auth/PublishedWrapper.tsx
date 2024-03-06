import React from "react";
import { FrozenState } from "../../openapi/v2";

type PublishedWrapperProps = {
	frozen: string | undefined;
	frozenVersionNum: number | undefined;
	children: JSX.Element | JSX.Element[];
};

export const PublishedWrapper = (props: PublishedWrapperProps): JSX.Element => {
	const { frozen, frozenVersionNum, children } = props;
	return (
		<>
			{frozen &&
			frozen === FrozenState.FROZEN &&
			frozenVersionNum &&
			frozenVersionNum > 0 ? (
				<></>
			) : (
				children
			)}
		</>
	);
};
