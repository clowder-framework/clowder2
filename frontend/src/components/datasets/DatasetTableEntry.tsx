import React, {useEffect, useState} from "react";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import {Dataset} from "@mui/icons-material";
import {Button} from "@mui/material";
import {parseDate} from "../../utils/common";
import {generateThumbnailUrl} from "../../utils/visualization";
import {MoreHoriz} from "@material-ui/icons";
import {DatasetOut} from "../../openapi/v2";

type DatasetTableEntryProps = {
	iconStyle: {};
	selectDataset: any;
	dataset: DatasetOut;
	selected: boolean;
};


export default function DatsetTableEntry(props: DatasetTableEntryProps) {
	const {iconStyle, selectDataset, dataset, selected} = props;
	const [thumbnailUrl, setThumbnailUrl] = useState("");

	useEffect(() => {
		let url = "";
		if (dataset.thumbnail_id) {
			url = generateThumbnailUrl(dataset.thumbnail_id);
		}
		setThumbnailUrl(url);
	}, [dataset]);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	return (
		<TableRow
			key={dataset.id}
			sx={{
				"&:last-child td, &:last-child th": {border: 0},
				//backgroundColor: selected ? theme.palette.secondary.main : null,
				backgroundColor: selected ? "lightyellow" : null,
			}}
		>
			<TableCell component="th" scope="row" key={`${dataset.id}-icon`}>
				{dataset.thumbnail_id ? (
					<img
						src={thumbnailUrl}
						alt="thumbnail"
						width="24"
						height="24"
						style={{verticalAlign: "middle"}}
					/>
				) : (
					<Dataset sx={iconStyle}/>
				)}
				<Button onClick={() => selectDataset(dataset.id, dataset.name)}>
					{dataset.name}
				</Button>
			</TableCell>
			<TableCell align="right">{parseDate(dataset.created)}</TableCell>
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
					<MoreHoriz/>
				</Button>
			</TableCell>
		</TableRow>
	);
}
