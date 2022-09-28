import React from "react";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";

export function Search() {
  // @ts-ignore
	return (
    <ReactiveBase
      url="http://localhost:9200"
      app="file"
      // enableAppbase
    >
      <DataSearch
	componentId="searchbox"
	dataField={[
		{
			"field": "name",
			"weight": 3
		},
		{
			"field": "creator",
			"weight": 1
		}
	]}
	placeholder="Search for file"
	  />
    </ReactiveBase>
  );
}
