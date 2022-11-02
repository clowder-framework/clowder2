import React from "react";
import {DataSearch, MultiDropdownList, ReactiveList, SingleDropdownRange} from "@appbaseio/reactivesearch";
import {Grid} from "@mui/material";
import Layout from "../Layout";
import {SearchResult} from "./SearchResult";


export function Search() {

	// custom Query to turn Lucene syntax search into DSL syntax search
	const customQuery = () => {
		 return {
			"query": {
			  "match": { "name": "water" }
			}
		 }
	}

	// @ts-ignore
	return (
		<Layout>
			<div className="outer-container">
				<Grid container spacing={4}>
					<Grid item xs>
						{/*search*/}
						<DataSearch
							title="Search for Datasets and Files"
							componentId="searchbox"
							autosuggest={true}
							highlight={true}
							queryFormat="or"
							fuzziness={0}
							debounce={100}
							react={{
								and: ["creatorfilter",
									"downloadfilter",
									"modifyfilter"]
							}}
							// apply react to the filter
							URLParams={true}
							showFilter={true}
							showClear
							renderNoSuggestion="No suggestions found."
							dataField={[
								{field: "name", weight: 3},
								{field: "description", weight: 2},
								{field: "author.keyword", weight: 1},
								{field: "creator.keyword", weight: 1}
							]}
							// placeholder="Search for Dataset"
							innerClass={{
								title: "search-title",
								input: "search-input",
							}}
							customQuery={customQuery}
						/>
						{/*filters*/}
						<Grid container spacing={2} sx={{marginBottom: "20px"}}>
							<Grid item xs={12} sm={4} md={4} lg={4}>
								<MultiDropdownList
									componentId="creatorfilter"
									dataField="author"
									size={5}
									sortBy="count"
									showCount={true}
									placeholder="Author: All"
									innerClass={{
										select: "filter-select"
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4} md={4} lg={4}>
								<SingleDropdownRange
									componentId="downloadfilter"
									dataField="download"
									data={[{start: 0, label: "0 time and up"},
										{start: 10, label: "10 times and up"},
										{start: 100, label: "100 times and up"},
									]}
									placeholder="Download Times: All"
									innerClass={{
										select: "filter-select"
									}}
								/>
							</Grid>
							<Grid item xs={12} sm={4} md={4} lg={4}>
								<SingleDropdownRange
									componentId="modifyfilter"
									dataField="modified"
									data={[{start: 0, label: "0 time and up"},
										{start: 10, label: "10 times and up"},
										{start: 100, label: "100 times and up"},

									]}
									placeholder="Modify Times: All"
									innerClass={{
										select: "filter-select"
									}}
								/>
							</Grid>
						</Grid>
						{/*result*/}
						<ReactiveList componentId="results" dataField="_score" size={20} pagination={true}
									  react={{
										and: ["searchbox", "creatorfilter", "downloadfilter", "modifyfilter"]
									  }}
									  render={({ data }) => (<SearchResult data={data} />)}/>
					</Grid>
				</Grid>
			</div>
		</Layout>
  );
}
