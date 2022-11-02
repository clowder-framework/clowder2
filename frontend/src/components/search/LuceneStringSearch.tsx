import React from "react";
import {DataSearch, ReactiveList} from "@appbaseio/reactivesearch";
import {Grid} from "@mui/material";
import Layout from "../Layout";
import {SearchResult} from "./SearchResult";


export function LuceneStringSearch() {

	// @ts-ignore
	return (
		<Layout>
			<div className="outer-container">
				<Grid container spacing={4}>
					<Grid item xs>
						{/*search*/}
						<DataSearch
							title="String Search for Datasets and Files"
							componentId="string-searchbox"
							autosuggest={false}
							highlight={false}
							queryFormat="or"
							fuzziness={0}
							debounce={100}
							URLParams={true}
							showFilter={false}
							showClear
							renderNoSuggestion="No suggestions found."
							innerClass={{
								title: "search-title",
								input: "search-input",
							}}
							queryString={true}
							// customQuery={customQuery}
						/>
						{/*result*/}
						<ReactiveList componentId="results" dataField="_score" size={20} pagination={true}
									  react={{
										and: ["string-searchbox"]
									  }}
									  render={({ data }) => (<SearchResult data={data} />)}/>
					</Grid>
				</Grid>
			</div>
		</Layout>
  );
}
