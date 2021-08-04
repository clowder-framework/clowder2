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
		position: "absolute",
		left: "0%",
		right: "0%",
		top: "0%",
		bottom: "0%",
		background: "#FFFFFF",
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	toolBarItem:{
		margin:"auto 12px auto 12px",
	},
	toolBarlink:{
		textDecoration: "none",
		fontFamily: "Open Sans",
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
					<IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
						<MenuIcon />
					</IconButton>
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
					<Button color="inherit">Login</Button>
				</Toolbar>
			</AppBar>
		</div>
	);
}
