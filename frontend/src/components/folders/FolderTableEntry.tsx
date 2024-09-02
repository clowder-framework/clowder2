import React from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Folder } from "@mui/icons-material";
import { Button } from "@mui/material";
import { parseDate } from "../../utils/common";
import { MoreHoriz } from "@material-ui/icons";

export function FolderTableEntry(props) {
	const { iconStyle, selectFolder, folder } = props;
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	return (
		<TableRow
			key={folder.id}
			sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
		>
			<TableCell component="th" scope="row" key={`${folder.id}-icon`}>
				<Folder sx={iconStyle} />
				<Button onClick={() => selectFolder(folder)}>{folder.name}</Button>
			</TableCell>
			<TableCell align="right">{parseDate(folder.created)}</TableCell>
			<TableCell align="right">-</TableCell>
			<TableCell align="right">-</TableCell>
			<TableCell align="right">
				<Button
					id="basic-button"
					size="small"
					aria-controls={open ? "basic-menu" : undefined}
					aria-haspopup="true"
					aria-expanded={open ? "true" : undefined}
					onClick={handleClick}
				>
					<MoreHoriz />
				</Button>
			</TableCell>
		</TableRow>
	);
}
