import React from "react";
import {ReactiveBase, DataSearch, MultiList, SingleRange, ReactiveList} from "@appbaseio/reactivesearch";
import {parseDate} from "../../utils/common";

import Cookies from "universal-cookie";
import DatasetCard from "../datasets/DatasetCard";
const cookies = new Cookies();

export function SearchDataset() {
	// @ts-ignore
	return (
    <ReactiveBase
      url="http://localhost:8000/api/v2/elasticsearch"
      app="dataset"
	  headers={{"Authorization": cookies.get("Authorization")}}
    >
		{/*search*/}
		<DataSearch componentId="searchbox"
					dataField={[
						{field: "name", weight: 3},
						{field: "description", weight: 2},
						{field: "author.keyword", weight: 2},
						]}
					placeholder="Search for Dataset"/>

		{/*filters*/}
		<MultiList componentId="creatorfilter" dataField="author" title="Filter by author" aggregationSize={5} showCheckbox/>
		<SingleRange componentId="downloadfilter" dataField="download" title="Filter by Download Times"
				   data={[{ start: 0, label: '0 time and up' },
					   { start: 1, label: '1 times and up' }]}
				   defaultValue="0 time and up" showRadio/>
		<SingleRange componentId="modifyfilter" dataField="modified" title="Filter by Modified Times"
						   data={[{ start: 0, label: '0 time and up' },
							   { start: 1, label: '1 times and up' }]}
						   defaultValue="0 time and up" showRadio/>
		{/*result*/}
		<ReactiveList componentId="results" dataField="_score" size={6} pagination={true}
					  react={{
					  	and: ["searchbox", "creatorfilter", "downloadfilter", "modifyfilter"]
					  }}
					  render={({ data }) => (
							<ReactiveList.ResultCardsWrapper>
							{data.map((item) => (
								<DatasetCard id={item._id} name={item.name} author={item.author}
											 created={parseDate(item.created)} description={item.description}/>
								))}
							</ReactiveList.ResultCardsWrapper>
							)}/>
    </ReactiveBase>
  );
}
