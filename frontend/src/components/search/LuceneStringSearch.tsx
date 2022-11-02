import React from "react";
import {DataSearch, ReactiveList} from "@appbaseio/reactivesearch";
import {Grid} from "@mui/material";
import Layout from "../Layout";
import {SearchResult} from "./SearchResult";
import {fromKueryExpression, toElasticsearchQuery} from "@cybernetex/kbn-es-query"

export function LuceneStringSearch() {

	// // custom Query to turn Lucene syntax search into DSL syntax search
	// // TODO need to turn off automatic suggest and react because it's not always a valid Lucene query when typing
	// // TODO need to use the official kbn-es-query
	// const customQuery = (text:string) => {
	// 	const node = fromKueryExpression(text)
	// 	const query = toElasticsearchQuery(node);
	// 	return {
	// 		"query": query
	// 	};
	// }

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
