import React, { useEffect, useState } from "react";
import { DataSearch, ReactiveBase } from "@appbaseio/reactivesearch";

import { useNavigate } from "react-router-dom";
import config from "../../app.config";
import { searchTheme } from "../../theme";
import Cookies from "universal-cookie";

export function EmbeddedSearch() {
	const history = useNavigate();
	const [searchValue, setSearchValue] = useState("");
	const [authorizationHeader, setAuthorizationHeader] = useState({});

	// Update the header when userAuthorization changes
	useEffect(() => {
		const cookies = new Cookies();
		setAuthorizationHeader({ Authorization: cookies.get("Authorization") });
	}, [searchValue]);

	// @ts-ignore
	return (
		<ReactiveBase
			url={config.searchEndpoint}
			app="all"
			headers={authorizationHeader}
			theme={searchTheme}
		>
			<DataSearch
				componentId="searchbox"
				autosuggest={true}
				highlight={true}
				queryFormat="or"
				fuzziness={0}
				debounce={100}
				// apply react to the filter
				URLParams={true}
				showFilter={true}
				showClear
				renderNoSuggestion="No suggestions found."
				dataField={["name", "description", "creator.keyword"]}
				// placeholder="Search for Dataset"
				innerClass={{
					title: "search-title",
					input: "embedded-search-input",
				}}
				onValueSelected={function (value, cause, _) {
					if (
						cause === "SUGGESTION_SELECT" ||
						cause === "ENTER_PRESS" ||
						cause === "SEARCH_ICON_CLICK"
					) {
						history(`/search?searchbox="${value}"`);
					}
				}}
				value={searchValue}
				onChange={(value) => setSearchValue(value)}
			/>
		</ReactiveBase>
	);
}
