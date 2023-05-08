import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { UserOut } from "../../openapi/v2";
import { Button } from "@mui/material";
import { theme } from "../../theme";
import Gravatar from "react-gravatar";
import PersonIcon from "@mui/icons-material/Person";

type GroupAndRoleSubTableEntryProps = {
	user: UserOut;
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export function GroupAndRoleSubTableEntry(
	props: GroupAndRoleSubTableEntryProps
) {
	const { user } = props;

	return (
		<TableRow
			key={user.id}
			sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
		>
			<TableCell />
			<TableCell align="right">
				{user.email ? (
					<Gravatar
						email={user.email}
						rating="g"
						style={{
							width: "32px",
							height: "32px",
							borderRadius: "50%",
							verticalAlign: "middle",
						}}
					/>
				) : (
					<PersonIcon sx={iconStyle} />
				)}
				<Button>
					{user.first_name} {user.last_name}
				</Button>
			</TableCell>
			<TableCell align="right">{user.email}</TableCell>
			<TableCell align="right" />
		</TableRow>
	);
}
