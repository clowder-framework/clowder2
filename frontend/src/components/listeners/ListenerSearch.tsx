import React, {useState} from "react";
import {Box, IconButton, InputBase} from "@mui/material";
import {SearchOutlined} from "@material-ui/icons";
import {queryListeners} from "../../actions/listeners";
import {useDispatch} from "react-redux";
import {theme} from "../../theme";

type ListenerSearchProps = {
	skip: number | undefined,
	limit: number | undefined,
}

export const ListenerSearch = (props: ListenerSearchProps) => {
	const {skip, limit} = props;

	const dispatch = useDispatch();

	const searchListeners = (text: string, skip: number | undefined, limit: number | undefined) =>
		dispatch(queryListeners(text, skip, limit));
	const [searchText, setSearchText] = useState<string>("");

	const handleListenerSearch = () => {
		searchListeners(searchText, skip, limit);
	}

	return (
		<Box
			component="form"
			sx={{
				p: "2px 4px",
				display: "flex",
				alignItems: "left",
				backgroundColor: theme.palette.primary.contrastText,
				width: "80%"
			}}
		>
			<InputBase
				sx={{ml: 1, flex: 1}}
				placeholder="keyword for extractor"
				inputProps={{"aria-label": "Type in keyword to search for extractor"}}
				onChange={(e) => {
					setSearchText(e.target.value);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
					}
					handleListenerSearch();
				}}
				value={searchText}
			/>
			<IconButton type="button" sx={{p: "10px"}} aria-label="search"
						onClick={handleListenerSearch}>
				<SearchOutlined/>
			</IconButton>
		</Box>
	);
}
