import React from 'react';
import Typography from '@material-ui/core/Typography';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';

function handleClick(event) {
	event.preventDefault();
}

export default function Breadcrumbs(props) {
	const {
		filename, ...other} = props;
	return (
		<MuiBreadcrumbs aria-label="breadcrumb">
			<Link color="inherit" href="/explore" onClick={handleClick}>
				Explore
			</Link>
			<Link color="inherit" href="/collection" onClick={handleClick}>
				Collection
			</Link>
			<Link color="inherit" href="/dataset" onClick={handleClick}>
				Dataset
			</Link>
			<Typography color="textPrimary">{filename}</Typography>
		</MuiBreadcrumbs>
	);
}
