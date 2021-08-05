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
		color: "#6C757D",
		textTransform: "capitalize"
	}
}));

export default function Breadcrumbs(props) {
	const classes = useStyles();

	const { paths, ...other} = props;
	return (
		<div>
			<MuiBreadcrumbs className={classes.breadCrumb} aria-label="breadcrumb">
				{
					paths.map((path, index) => {
						if (index !== paths.length -1){
							return (<Link color="inherit" href={path} className={classes.breadCrumbLink}>{path}</Link>);
						}
						else{
							return (<Typography className={classes.breadCrumbText}>{path}</Typography>);
						}
					})
				}
			</MuiBreadcrumbs>
			<Divider light />
		</div>

	);
}
