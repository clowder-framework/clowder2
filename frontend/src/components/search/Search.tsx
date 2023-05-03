import React, { useState } from "react";
import {
	DataSearch,
	DateRange,
	MultiDropdownList,
	ReactiveComponent,
	ReactiveList,
	SingleDropdownRange,
} from "@appbaseio/reactivesearch";
import { FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import Layout from "../Layout";
import { SearchResult } from "./SearchResult";
import { SearchErrorBoundary } from "./SearchErrorBoundary";
import { theme } from "../../theme";
import { getCurrEmail } from "../../utils/common";

export function Search() {
	const email = getCurrEmail();

	const [luceneOn, setLuceneOn] = useState(false);

	// @ts-ignore
	return (
		<Layout>
			<div className="outer-container">
				<Grid container spacing={4}>
					<Grid item xs>
						<FormControlLabel
							sx={{ float: "right" }}
							control={
								<Switch
									checked={luceneOn}
									onChange={() => {
										setLuceneOn((prevState) => !prevState);
									}}
									name="Query String"
								/>
							}
							label={
								<Typography
									variant="body1"
									sx={{
										color: theme.palette.primary.main,
										fontWeight: "bold",
									}}
								>
									Advanced
								</Typography>
							}
						/>
						{luceneOn ? (
							// string search
							<DataSearch
								title="String Search for Datasets and Files"
								placeholder="Please use Lucene Syntax string query.
									E.g.name:water~2 AND download:[0 TO 40} AND creator:myersrobert@scott-gutierrez.com"
								componentId="string-searchbox"
								autosuggest={false}
								highlight={false}
								queryFormat="or"
								fuzziness={0}
								debounce={100}
								showFilter={false}
								showClear
								renderNoSuggestion="No suggestions found."
								innerClass={{
									title: "search-title",
									input: "search-input",
								}}
								queryString={true}
							/>
						) : (
							// facet search
							<>
								{/*search*/}
								<DataSearch
									title="Search for Datasets and Files"
									placeholder="Type in any keyword that you wish to search..."
									componentId="searchbox"
									autosuggest={true}
									highlight={true}
									queryFormat="or"
									fuzziness={0}
									debounce={100}
									react={{
										and: [
											"creatorfilter",
											"downloadfilter",
											"modifyfilter",
											"authFilter",
										],
									}}
									// apply react to the filter
									URLParams={true}
									showFilter={true}
									showClear={false}
									renderNoSuggestion="No suggestions found."
									dataField={[
										{ field: "name", weight: 3 },
										{ field: "description", weight: 2 },
										{ field: "creator.keyword", weight: 1 },
									]}
									innerClass={{
										title: "search-title",
										input: "search-input",
									}}
								/>

								{/*authorization clause - searcher must be creator or have permission to view result*/}
								<ReactiveComponent
									componentId="authFilter"
									customQuery={() => ({
										query: {
											bool: {
												should: [
													// TODO: Include if dataset is public
													{
														term: {
															creator: email,
														},
													},
													{
														term: {
															user_ids: email,
														},
													},
												],
											},
										},
									})}
								/>

								{/*filters*/}
								<Grid container spacing={2} sx={{ marginBottom: "20px" }}>
									<Grid item xs={12} sm={4} md={4} lg={4}>
										<MultiDropdownList
											componentId="creatorfilter"
											dataField="creator"
											size={5}
											sortBy="count"
											showCount={true}
											placeholder="Creator: All"
											innerClass={{
												select: "filter-select",
											}}
										/>
									</Grid>
									<Grid item xs={12} sm={4} md={4} lg={4}>
										<SingleDropdownRange
											componentId="downloadfilter"
											dataField="downloads"
											data={[
												{ start: 0, label: "Download Times: All" },
												{ start: 10, label: "10 time and up" },
												{ start: 100, label: "100 times and up" },
												{ start: 1000, label: "1000 times and up" },
											]}
											innerClass={{
												select: "filter-select",
											}}
											defaultValue={"Download Times: All"}
										/>
									</Grid>
									<Grid item xs={12} sm={4} md={4} lg={4}>
										<DateRange
											componentId="modifyfilter"
											dataField="created"
											focused={false}
											autoFocusEnd={true}
											numberOfMonths={1}
											queryFormat="date_time_no_millis"
											showClear={true}
											showFilter={true}
											filterLabel="Date"
											URLParams={false}
											placeholder={{
												start: "From Date",
												end: "To Date",
											}}
										/>
									</Grid>
								</Grid>
							</>
						)}
						<SearchErrorBoundary>
							{/*result*/}
							{luceneOn ? (
								<ReactiveList
									componentId="results"
									dataField="_score"
									size={20}
									pagination={true}
									react={{
										and: ["string-searchbox"],
									}}
									render={({ data }) => <SearchResult data={data} />}
								/>
							) : (
								<ReactiveList
									componentId="results"
									dataField="_score"
									size={20}
									pagination={true}
									react={{
										and: [
											"searchbox",
											"creatorfilter",
											"downloadfilter",
											"modifyfilter",
											"authFilter",
										],
									}}
									render={({ data }) => <SearchResult data={data} />}
								/>
							)}
						</SearchErrorBoundary>
					</Grid>
				</Grid>
			</div>
		</Layout>
	);
}
