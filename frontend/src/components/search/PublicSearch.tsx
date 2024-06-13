import React, { useEffect, useState } from "react";
import {
	DataSearch,
	DatePicker,
	MultiDropdownList,
	ReactiveBase,
	ReactiveList,
	SingleDropdownRange,
} from "@appbaseio/reactivesearch";
import { FormControlLabel, Grid, Switch, Typography } from "@mui/material";
import PublicLayout from "../PublicLayout";
import { searchTheme, theme } from "../../theme";
import config from "../../app.config";
import { PublicSearchResult } from "./PublicSearchResult";

export function PublicSearch() {
	const [luceneOn, setLuceneOn] = useState(false);

	// toggle super admin
	// const adminMode = useSelector((state: RootState) => state.user.adminMode);

	// @ts-ignore
	return (
		<PublicLayout>
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
						<ReactiveBase
							url={config.publicSearchEndpoint}
							app="all"
							theme={searchTheme}
						>
							{luceneOn ? (
								// string search
								<DataSearch
									title="String Search for Datasets, Files and Metadata"
									placeholder="Please use Lucene Syntax string query.
									E.g.name:water~2 AND download:[0 TO 40} AND creator:myersrobert@scott-gutierrez.com"
									componentId="string-searchbox"
									autosuggest={false}
									highlight={true}
									queryFormat="and"
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
										queryFormat="and"
										fuzziness={0}
										debounce={100}
										react={{
											and: ["downloadfilter", "fromfilter", "tofilter"],
										}}
										// apply react to the filter
										URLParams={true}
										showFilter={true}
										showClear={true}
										renderNoSuggestion="No suggestions found."
										dataField={["name", "description"]}
										fieldWeights={[3, 2, 1]}
										innerClass={{
											title: "search-title",
											input: "search-input",
										}}
									/>

									{/*filters*/}
									<Grid container spacing={2} sx={{ marginBottom: "20px" }}>
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
										<Grid item xs={6} sm={2} md={2} lg={2}>
											<DatePicker
												dataField="created"
												componentId="fromfilter"
												placeholder="Start Date"
												customQuery={function (value, props) {
													return {
														query: {
															range: {
																created: {
																	gte: value,
																},
															},
														},
													};
												}}
											/>
										</Grid>
										<Grid item xs={6} sm={2} md={2} lg={2}>
											<DatePicker
												dataField="created"
												componentId="tofilter"
												placeholder="End Date"
												customQuery={function (value, props) {
													return {
														query: {
															range: {
																created: {
																	lte: value,
																},
															},
														},
													};
												}}
											/>
										</Grid>
									</Grid>
								</>
							)}
							{/*result*/}
							{luceneOn ? (
								<ReactiveList
									componentId="results"
									dataField="created"
									size={20}
									pagination={true}
									react={{
										and: ["string-searchbox"],
									}}
									render={({ data }) => <PublicSearchResult data={data} />}
									sortBy="desc"
								/>
							) : (
								<ReactiveList
									componentId="results"
									dataField="created"
									size={20}
									pagination={true}
									react={{
										and: [
											"searchbox",
											"downloadfilter",
											"fromfilter",
											"tofilter",
										],
									}}
									render={({ data }) => {
										return <PublicSearchResult data={data} />;
									}}
									sortBy="desc"
								/>
							)}
						</ReactiveBase>
					</Grid>
				</Grid>
			</div>
		</PublicLayout>
	);
}
