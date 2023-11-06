import Typography from "@mui/material/Typography";
import { theme } from "../../theme";
import { Box, IconButton, InputBase } from "@mui/material";
import { SearchOutlined } from "@material-ui/icons";
import React from "react";

type GenericSearchBoxProps = {
	title: string;
	searchPrompt: string;
	setSearchTerm: any;
	searchTerm: string;
	searchFunction: any;
	skip?: number;
	limit?: number;
};

export function GenericSearchBox(props: GenericSearchBoxProps) {
	const {
		title,
		searchPrompt,
		setSearchTerm,
		searchTerm,
		searchFunction,
		skip,
		limit,
	} = props;
	return (
		<>
			<Typography
				sx={{
					fontSize: "1rem",
					color: theme.palette.primary.light,
					fontWeight: 600,
				}}
			>
				{title}
			</Typography>
			<Box
				component="form"
				sx={{
					border: "1px solid #ced4da",
					borderRadius: "6px",
					mb: 2,
					p: "2px 4px",
					display: "flex",
					alignItems: "left",
					backgroundColor: theme.palette.primary.contrastText,
				}}
			>
				<InputBase
					sx={{ ml: 1, flex: 1 }}
					placeholder={searchPrompt}
					inputProps={{
						"aria-label": { searchPrompt },
					}}
					onChange={(e) => {
						setSearchTerm(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							searchFunction(searchTerm, skip, limit);
						}
					}}
					value={searchTerm}
				/>
				<IconButton
					type="button"
					sx={{ p: "10px" }}
					aria-label="search"
					onClick={() => {
						searchFunction(searchTerm, skip, limit);
					}}
				>
					<SearchOutlined />
				</IconButton>
			</Box>
		</>
	);
}
