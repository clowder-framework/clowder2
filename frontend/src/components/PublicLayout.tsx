import * as React from "react";
import { useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link, Menu, MenuItem, MenuList } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types/data";
import { Explore } from "@material-ui/icons";
import PersonIcon from "@mui/icons-material/Person";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LogoutIcon from "@mui/icons-material/Logout";
import { EmbeddedSearch } from "./search/EmbeddedSearch";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
	open?: boolean;
}>(({ theme, open }) => ({
	flexGrow: 1,
	padding: theme.spacing(3),
	transition: theme.transitions.create("margin", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	marginLeft: `-${drawerWidth}px`,
	...(open && {
		transition: theme.transitions.create("margin", {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	}),
}));

const SearchDiv = styled("div")(({ theme }) => ({
	position: "relative",
	marginLeft: theme.spacing(3),
	marginBottom: "-5px", // to compoensate the tags div
	width: "50%",
}));

interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
	transition: theme.transitions.create(["margin", "width"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: `${drawerWidth}px`,
		transition: theme.transitions.create(["margin", "width"], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: "flex-end",
}));

const link = {
	textDecoration: "none",
	fontSize: "16px",
	color: "#495057",
	m: 2,
};

export default function PersistentDrawerLeft(props) {
	const { children } = props;
	const theme = useTheme();
	const [open, setOpen] = React.useState(false);
	const [embeddedSearchHidden, setEmbeddedSearchHidden] = React.useState(false);
	const [anchorEl, setAnchorEl] = React.useState(null);
	const isMenuOpen = Boolean(anchorEl);

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	const handleProfileMenuOpen = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleProfileMenuClose = () => {
		setAnchorEl(null);
	};

	const location = useLocation();

	useEffect(() => {
		if (location.pathname.includes("search")) {
			setEmbeddedSearchHidden(true);
		} else {
			setEmbeddedSearchHidden(false);
		}
	}, [location]);

	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);

	// @ts-ignore
	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar position="fixed" open={open}>
				<Toolbar>
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={handleDrawerOpen}
						edge="start"
						sx={{ mr: 2, ...(open && { display: "none" }) }}
					>
						<MenuIcon />
					</IconButton>
					<Link component={RouterLink} to="/">
						<Box
							component="img"
							src="../../public/blue-clowder-logo-sm.svg"
							alt="clowder-logo-sm"
							sx={{ verticalAlign: "middle" }}
						/>
					</Link>

					{/*for searching*/}
					<SearchDiv hidden={true}>
						{/*	<InputSearchBox />*/}
						<EmbeddedSearch />
					</SearchDiv>
					<Box sx={{ flexGrow: 1 }} />
					<Box sx={{ marginLeft: "auto" }}>
						<Link component={RouterLink} to="/auth/register" sx={link}>
							Register
						</Link>
						<Link component={RouterLink} to="/auth/login" sx={link}>
							Login
						</Link>
					</Box>
				</Toolbar>
			</AppBar>
			{/*Profile menu*/}
			<MenuList>
				<Menu
					anchorEl={anchorEl}
					anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
					id={"primary-search-account-menu"}
					keepMounted
					transformOrigin={{ vertical: "top", horizontal: "center" }}
					open={isMenuOpen}
					onClose={handleProfileMenuClose}
				>
					<MenuItem component={RouterLink} to="/profile">
						<ListItemIcon>
							<PersonIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>User Profile</ListItemText>
					</MenuItem>
					<Divider orientation="horizontal" />
					<MenuItem component={RouterLink} to="/apikeys">
						<ListItemIcon>
							<VpnKeyIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>API Key</ListItemText>
					</MenuItem>
					<Divider orientation="horizontal" />
					<MenuItem component={RouterLink} to="/auth/logout">
						<ListItemIcon>
							<LogoutIcon fontSize="small" />
						</ListItemIcon>
						<ListItemText>Log Out</ListItemText>
					</MenuItem>
				</Menu>
			</MenuList>
			{/*side drawer*/}
			<Drawer
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: drawerWidth,
						boxSizing: "border-box",
					},
				}}
				variant="persistent"
				anchor="left"
				open={open}
			>
				<DrawerHeader>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === "ltr" ? (
							<ChevronLeftIcon />
						) : (
							<ChevronRightIcon />
						)}
					</IconButton>
				</DrawerHeader>
				<Divider />
				<List>
					<ListItem key={"public"} disablePadding>
						<ListItemButton component={RouterLink} to="/public">
							<ListItemIcon>
								<Explore />
							</ListItemIcon>
							<ListItemText primary={"Public"} />
						</ListItemButton>
					</ListItem>
				</List>
				<Divider />
				<List>
					{/*search commented out for now*/}
					{/*<ListItem key={"search"} disablePadding>*/}
					{/*	<ListItemButton component={RouterLink} to="/search">*/}
					{/*		<ListItemIcon>*/}
					{/*			<SearchDatasetIcon />*/}
					{/*		</ListItemIcon>*/}
					{/*		<ListItemText primary={"Search"} />*/}
					{/*	</ListItemButton>*/}
					{/*</ListItem>*/}
				</List>
				{/*<Divider />*/}
			</Drawer>
			<Main open={open}>
				<DrawerHeader />
				{children}
			</Main>
		</Box>
	);
}
