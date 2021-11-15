import React from 'react';
import Typography from '@material-ui/core/Typography';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
	breadCrumb:{
		padding:"28px"
	},
	breadCrumbText:{
		fontStyle: "normal",
		fontWeight: 600,
		fontSize: "24px",
		color: "#343A40"
	},
	breadCrumbLink:{
		fontStyle: "normal",
		fontWeight: 600,
		fontSize: "24px",
		color: "#6C757D",
	}
}));

type BreadCrumbProps = {
	paths: any,
	goToPath: any
}
export const Breadcrumbs: React.FC<BreadCrumbProps> = (props:BreadCrumbProps) => {
	const classes = useStyles();

	const { paths, goToPath,} = props;
	return (
		<div>
			<MuiBreadcrumbs className={classes.breadCrumb} aria-label="breadcrumb">
				<MuiBreadcrumbs className={classes.breadCrumb} aria-label="breadcrumb">
					<Link color="inherit" className={classes.breadCrumbLink} href="">Explore</Link>
					{
						paths.map((path:any, index:number) => {
							if (index !== paths.length -1){
								return (<Link className={classes.breadCrumbLink}
												onClick={() => goToPath(path["type"], path["id"])}>{path["name"]}
								</Link>);
							}
							else{
								return (<Typography className={classes.breadCrumbText}>{path["name"]}</Typography>);
							}
						})
					}
				</MuiBreadcrumbs>
			</MuiBreadcrumbs>
			<Divider light />
		</div>
	);
}
