import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
	AppBar,
	Link,
	Toolbar,
	Typography,
	Button,
	IconButton,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar:{
		background: "#FFFFFF",
		boxShadow: "none"
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	logo:{
		marginRight:"50px"
	},
	toolBarItem:{
		margin:"auto 12px auto 12px",
	},
	toolBarlink:{
		textDecoration: "none",
		fontSize: "16px",
		color: "#495057",
	},
	title: {
		flexGrow: 1,
	},
}));

export default function TopBar() {
	const classes = useStyles();

	return (
		<div className={classes.root}>
			<AppBar position="static" className={classes.appBar}>
				<Toolbar>
					<img className={classes.logo} src="../../public/clowder-logo-sm.svg" alt="clowder-logo-sm"/>
					<Typography className={classes.toolBarItem}>
						<Link href="/" target="_blank" className={classes.toolBarlink}>
							Home</Link>
					</Typography>
					<Typography className={classes.toolBarItem}>
						<Link href="/" target="_blank" className={classes.toolBarlink}>
							Help</Link>
					</Typography>
					<Typography className={classes.toolBarItem}>
						<Link href="/" target="_blank" className={classes.toolBarlink}>
							Explore</Link>
					</Typography>
					<Typography className={classes.toolBarItem}>
						<Link href="/" target="_blank" className={classes.toolBarlink}>
							Create</Link>
					</Typography>
				</Toolbar>
			</AppBar>
		</div>
	);
}
