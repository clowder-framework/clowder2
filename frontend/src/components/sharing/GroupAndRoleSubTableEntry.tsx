import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { UserOut } from "../../openapi/v2";
import { Link } from "@mui/material";
import { theme } from "../../theme";
import Gravatar from "react-gravatar";
import PersonIcon from "@mui/icons-material/Person";

type GroupAndRoleSubTableEntryProps = {
	user: UserOut;
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
	width: "20px",
	marginRight: "0.5em",
};

export function GroupAndRoleSubTableEntry(
	props: GroupAndRoleSubTableEntryProps
) {
	const { user } = props;

	return (
		<TableRow
			key={user.id}
			sx={{
				"&:last-child td, &:last-child th": {
					border: 0,
				},
				paddingLeft: 0,
			}}
		>
			<TableCell />
			<TableCell align="left">
				{user.email ? (
					<Gravatar
						email={user.email}
						rating="g"
						style={{
							width: "20px",
							height: "20px",
							borderRadius: "50%",
							verticalAlign: "middle",
							marginRight: "0.5em",
						}}
					/>
				) : (
					<PersonIcon sx={iconStyle} />
				)}
				{/*TODO once personal profile page is ready link to it*/}
				<Link sx={{ textDecoration: "None" }}>
					{user.first_name} {user.last_name}
				</Link>
			</TableCell>
			<TableCell align="right">{user.email}</TableCell>
			<TableCell align="right" />
			<TableCell align="right" />
		</TableRow>
	);
}
