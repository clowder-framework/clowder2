import React from "react";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import { parseDate } from "../../utils/common";

export const ListenerAgent = (props) => {
	const { created, agent } = props;
	const agentId = `agent-${agent.id}`;
	return (
		<TableContainer sx={{ padding: "1em 0" }}>
			<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={"small"}>
				<TableHead>
					<TableRow>
						<TableCell sx={{ fontWeight: "bold", border: 0 }}>
							Listener Name
						</TableCell>
						<TableCell sx={{ fontWeight: "bold", border: 0 }}>
							Version
						</TableCell>
						<TableCell sx={{ fontWeight: "bold", border: 0 }}>
							Created At
						</TableCell>
						<TableCell sx={{ fontWeight: "bold", border: 0 }}>
							Created By
						</TableCell>
					</TableRow>
				</TableHead>
				<TableRow key={agentId}>
					<TableCell component="th" scope="row">
						{agent.listener.name}
					</TableCell>
					<TableCell component="th" scope="row">
						{agent.listener.version}
					</TableCell>
					<TableCell component="th" scope="row">
						{parseDate(created)}
					</TableCell>
					<TableCell component="th" scope="row">
						{agent.creator.first_name} {agent.creator.last_name}
					</TableCell>
				</TableRow>
			</Table>
		</TableContainer>
	);
};
