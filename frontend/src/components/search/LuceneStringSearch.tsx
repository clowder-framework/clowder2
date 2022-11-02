import React from "react";
import {DataSearch, ReactiveList} from "@appbaseio/reactivesearch";
import {Grid} from "@mui/material";
import Layout from "../Layout";
import {SearchResult} from "./SearchResult";


export function LuceneStringSearch() {

	// custom Query to turn Lucene syntax search into DSL syntax search
	const customQuery = (text:string) => {
		 return {
			"query": {
			  "match": { "name": text }
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
							title="String Search for Datasets and Files"
							componentId="string-searchbox"
							autosuggest={false}
							highlight={true}
							queryFormat="or"
							fuzziness={0}
							debounce={100}
							// URLParams={true}
							showFilter={true}
							showClear
							renderNoSuggestion="No suggestions found."
							innerClass={{
								title: "search-title",
								input: "search-input",
							}}
							customQuery={customQuery}
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
