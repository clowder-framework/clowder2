import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, InputBase, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export function InputSearchBox() {
	const history = useNavigate();

	const [query, setQuery] = useState("");

	const querySearch = () => {
		// Redirect to the search page
		history(`/search?searchbox="${query}"`);

		// Then empty query string
		setQuery("");
	};

	return (
		<Paper
			variant="outlined"
			square
			component="form"
			sx={{
				p: "2px 4px",
				display: "flex",
				alignItems: "center",
				width: "100%",
			}}
			onSubmit={querySearch}
		>
			<IconButton
				color="primary"
				sx={{ p: "10px" }}
				aria-label="search-icon"
				onClick={querySearch}
			>
				<SearchIcon />
			</IconButton>
			<InputBase
				sx={{ ml: 1, flex: 1 }}
				placeholder="Search"
				inputProps={{ "aria-label": "search-input" }}
				onChange={(event) => setQuery(event.target.value)}
				value={query}
			/>
		</Paper>
	);
}
