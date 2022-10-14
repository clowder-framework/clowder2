import React from "react";
import {ReactiveBase, DataSearch} from "@appbaseio/reactivesearch";

import Cookies from "universal-cookie";
import {searchTheme} from "../../theme";

const cookies = new Cookies();


export function EmbeddedSearch() {
	// @ts-ignore
	return (
		<ReactiveBase
			// TODO put it in the Config file or other ways to dynamically pass in
		  url="http://localhost:8000/api/v2/elasticsearch"
		  app="dataset"
		  headers={{"Authorization": cookies.get("Authorization")}}
		  // transformResponse={(elasticsearchResponse) => {
		  // 	console.log(elasticsearchResponse)
		  // 	// if (elasticsearchResponse.detail.error === "invalid_token"){
		  // 	// 	console.log("token expired!");
			// // }
		  // }}
		  theme={searchTheme}
		>
			{/*search*/}
			<DataSearch componentId="searchbox" autosuggest={true}
				highlight={true} queryFormat="or" fuzziness={0}
				debounce={100}
				// apply react to the filter
				URLParams={true}
				showFilter={true}
				showClear
				renderNoSuggestion="No suggestions found."
				dataField={[
					{field: "name", weight: 3},
					{field: "description", weight: 2},
					{field: "author.keyword", weight: 2},
					]}
				// placeholder="Search for Dataset"
				innerClass={{
					title: "search-title",
					input: "embedded-search-input",
				}}
			/>
		</ReactiveBase>
  );
}
