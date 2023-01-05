import React from "react";
import {useDispatch} from "react-redux";
import {fetchListeners} from "../../actions/listeners";
import {Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";


export const ListenerFilter = (props) => {
	const {skip, limit, categories} = props;
	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined) => dispatch(fetchListeners(skip, limit));

	return (
		<Box sx={{margin: "2em auto", padding: "0.5em"}}>
			<FormControl>
				<FormLabel id="radio-buttons-group-label">Filter by category</FormLabel>
				<RadioGroup
					aria-labelledby="radio-buttons-group-label"
					defaultValue="all"
					name="radio-buttons-group"
				>
					<FormControlLabel value="all" control={<Radio/>} label="All"/>
					{
						categories.map((category: string) => {
							return <FormControlLabel value={category} control={<Radio/>} label={category}/>
						})
					}
				</RadioGroup>
			</FormControl>
		</Box>
	);
}
