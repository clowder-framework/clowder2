import React from "react";
import {DataSearch} from "@appbaseio/reactivesearch";

import {useNavigate} from "react-router-dom";
import {SearchErrorBoundary} from "./SearchErrorBoundary";


export function EmbeddedSearch() {
	// TODO pass down a props to determine which index to search

	const history = useNavigate();

	// @ts-ignore
	return (
		<>
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
				onValueSelected={
					function(value, cause, _) {
						if (cause === "SUGGESTION_SELECT" ||
							cause === "ENTER_PRESS" ||
							cause === "SEARCH_ICON_CLICK"){
							history(`/search?searchbox="${value}"`);
						}
					}
				  }
				queryString={true}
			/>
			<SearchErrorBoundary />
		</>
  );
}
