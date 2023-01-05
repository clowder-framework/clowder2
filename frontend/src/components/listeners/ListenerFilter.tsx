import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {fetchListeners} from "../../actions/listeners";
import {Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";


export const ListenerFilter = (props) => {
	const {skip, limit, categories} = props;
	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined, selectedCategory: string) => dispatch(fetchListeners(skip, limit, selectedCategory));

	const [value, setValue] = useState("");

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedCategory = (event.target as HTMLInputElement).value;
		setValue(selectedCategory);
		listListeners(skip, limit, selectedCategory);
	}

	return (
		<Box sx={{margin: "2em auto", padding: "0.5em"}}>
			<FormControl>
				<FormLabel id="radio-buttons-group-label">Filter by category</FormLabel>
				<RadioGroup
					aria-labelledby="radio-buttons-group-label"
					defaultValue="all"
					name="radio-buttons-group"
					value={value}
					onChange={handleChange}
				>
					<FormControlLabel value="" control={<Radio/>} label="all"/>
					{
						categories.map((category: string) => {
							return <FormControlLabel value={category} control={<Radio/>} label={category.toLowerCase()}/>
						})
					}
				</RadioGroup>
			</FormControl>
		</Box>
	);
}
