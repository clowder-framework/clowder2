import React, { useState } from "react";
import {
	DataSearch,
	DatePicker,
	MultiDropdownList,
	ReactiveComponent,
	ReactiveList,
} from "@appbaseio/reactivesearch";
import { Grid } from "@mui/material";
import Layout from "../Layout";
import { SearchResult } from "./SearchResult";
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
											"fromfilter",
											"tofilter",
											"authFilter",
										],
									}}
									// apply react to the filter
									URLParams={true}
									showFilter={true}
									showClear={false}
									renderNoSuggestion="No suggestions found."
									dataField={["name", "description", "creator.keyword"]}
									fieldWeights={[3, 2, 1]}
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
										"fromfilter",
										"tofilter",
										"authFilter",
									],
								}}
								render={({ data }) => <SearchResult data={data} />}
							/>
						)}
					</Grid>
				</Grid>
			</div>
		</Layout>
	);
}
