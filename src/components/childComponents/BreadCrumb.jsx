import React from 'react';
import Typography from '@material-ui/core/Typography';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
	breadCrumb:{
		padding:"28px"
	},
	breadCrumbText:{
		fontStyle: "normal",
		fontWeight: "600",
		fontSize: "24px",
		color: "#343A40"
	},
	breadCrumbLink:{
		fontStyle: "normal",
		fontWeight: "600",
		fontSize: "24px",
		color: "#6C757D"
	}
}));

export default function Breadcrumbs(props) {
	const classes = useStyles();

	const {
		filename, ...other} = props;
	return (
		<div>
			<MuiBreadcrumbs className={classes.breadCrumb} aria-label="breadcrumb">
				<Link color="inherit" href="/explore" className={classes.breadCrumbLink}>
					Explore
				</Link>
				<Link color="inherit" href="/collection" className={classes.breadCrumbLink}>
					Collection
				</Link>
				<Link color="inherit" href="/dataset" className={classes.breadCrumbLink}>
					Dataset
				</Link>
				<Typography className={classes.breadCrumbText}>{filename}</Typography>
			</MuiBreadcrumbs>
			<Divider light />
		</div>

	);
}
