import * as React from 'react';
import {useEffect} from 'react';
import {styled, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar, {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchDatasetIcon from '@mui/icons-material/Search';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {Grid, Link} from "@mui/material";
import {Link as RouterLink, Navigate, useLocation} from 'react-router-dom';
import {useSelector} from "react-redux";
import {RootState} from "../types/data";
import {AddBox, Explore} from "@material-ui/icons";
import {EmbeddedSearch} from "./search/EmbeddedSearch";
import {searchTheme} from "../theme";
import {ErrorBoundary, ReactiveBase} from "@appbaseio/reactivesearch";
import Cookies from "universal-cookie";
import { V2 } from '../openapi';

const cookies = new Cookies();

const drawerWidth = 240;

const Main = styled('main', {shouldForwardProp: (prop) => prop !== 'open'})<{
	open?: boolean;
}>(({theme, open}) => ({
	flexGrow: 1,
	padding: theme.spacing(3),
	transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	marginLeft: `-${drawerWidth}px`,
	...(open && {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	}),
}));

const SearchDiv = styled("div")(({theme}) => ({
	position: "relative",
	marginLeft: theme.spacing(3),
	marginBottom: "-5px",  // to compoensate the tags div
	width: "50%",
}));

interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
	transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: `${drawerWidth}px`,
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const DrawerHeader = styled('div')(({theme}) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'flex-end',
}));

const link = {
	textDecoration: "none",
	fontSize: "16px",
	color: "#495057",
	m: 2,
};

export default function PersistentDrawerLeft(props) {
	const {children} = props;
	const theme = useTheme();
	const [open, setOpen] = React.useState(false);
	const [embeddedSearchHidden, setEmbeddedSearchHidden] = React.useState(false);

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const location = useLocation();

	useEffect(() => {
		if (location.pathname.includes("search")) {
			setEmbeddedSearchHidden(true);
		} else {
			setEmbeddedSearchHidden(false);
		}
	}, [location])

	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);


	// @ts-ignore
	return (
		// Wrap reactive search base on the most outside component
		<ReactiveBase
			// TODO put it in the Config file or other ways to dynamically pass in
			url="http://localhost:8000/api/v2/elasticsearch"
			app="file,dataset"
			headers={{"Authorization": cookies.get("Authorization")}}
			theme={searchTheme}
		>
			<Box sx={{display: 'flex'}}>
				<CssBaseline/>
				<AppBar position="fixed" open={open}>
					<Toolbar>
						<IconButton
							color="inherit"
							aria-label="open drawer"
							onClick={handleDrawerOpen}
							edge="start"
							sx={{mr: 2, ...(open && {display: 'none'})}}
						>
							<MenuIcon/>
						</IconButton>
						<Link href="/">
							<Box component="img" src="../../public/clowder-logo-sm.svg" alt="clowder-logo-sm"
								 sx={{verticalAlign: "middle"}}/>
						</Link>

						{/*for searching*/}
						<SearchDiv hidden={embeddedSearchHidden}>
								<ErrorBoundary
									renderError={error => (
										<>
											{
												(() => {
													if (error["status"] === 401) {
														V2.OpenAPI.TOKEN = undefined;
														cookies.remove("Authorization", {path: "/"});
														return <Navigate to="/auth/login"/>
													} else {
														// TODO add prettier message or report function
														return <h1>An error has happened.</h1>
													}
												})()
											}
										</>
									)}
								>
									<EmbeddedSearch/>
								</ErrorBoundary>
						</SearchDiv>
						<Box sx={{flexGrow: 1}}/>
						<Box sx={{marginLeft: "auto"}}>
							{
								loggedOut ?
									<>
										<Link href="/auth/register" sx={link}>Register</Link>
										<Link href="/auth/login" sx={link}>Login</Link>
									</>
									:
									<Link href="/auth/logout" sx={link}>Logout</Link>
							}
						</Box>
					</Toolbar>
				</AppBar>
				<Drawer
					sx={{
						width: drawerWidth,
						flexShrink: 0,
						'& .MuiDrawer-paper': {
							width: drawerWidth,
							boxSizing: 'border-box',
						},
					}}
					variant="persistent"
					anchor="left"
					open={open}
				>
					<DrawerHeader>
						<IconButton onClick={handleDrawerClose}>
							{theme.direction === 'ltr' ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
						</IconButton>
					</DrawerHeader>
					<Divider/>
					<List>
						<ListItem key={"explore"} disablePadding>
							<ListItemButton component={RouterLink} to="/">
								<ListItemIcon>
									<Explore/>
								</ListItemIcon>
								<ListItemText primary={"Explore"}/>
							</ListItemButton>
						</ListItem>
					</List>
					<Divider/>
					<List>
						<ListItem key={"search"} disablePadding>
							<ListItemButton component={RouterLink} to="/search">
								<ListItemIcon>
									<SearchDatasetIcon/>
								</ListItemIcon>
								<ListItemText primary={"Search"}/>
							</ListItemButton>
						</ListItem>
					</List>
					<Divider/>
					<List>
						<ListItem key={"newdataset"} disablePadding>
							<ListItemButton component={RouterLink} to="/create-dataset">
								<ListItemIcon>
									<AddBox/>
								</ListItemIcon>
								<ListItemText primary={"New Dataset"}/>
							</ListItemButton>
						</ListItem>
					</List>
				</Drawer>
				<Main open={open}>
					<DrawerHeader/>
					{children}
				</Main>
			</Box>
		</ReactiveBase>
	);
}
