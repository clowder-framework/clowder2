import React from "react";
import {ReactiveBase, DataSearch, MultiList, SingleRange, ReactiveList, ResultCard} from "@appbaseio/reactivesearch";
import {parseDate} from "../../utils/common";

import Cookies from "universal-cookie";
const cookies = new Cookies();

export function Search() {
	// @ts-ignore
	return (
    <ReactiveBase
      // url="http://localhost:9200"
      url="http://localhost:8000/api/v2/elasticsearch"
      app="file"
	  headers={{"Authorization": cookies.get("Authorization")}}
    >
		{/*search*/}
		<DataSearch componentId="searchbox"
					dataField={[
						{field: "name", weight: 3},
						{field: "creator", weight: 2},
						{field:"creator.keyword", weight:1}
						]}
					placeholder="Search for file"/>

		{/*filters*/}
		<MultiList componentId="creatorfilter" dataField="creator.keyword" title="Filter by Creator" aggregationSize={5} showCheckbox/>
		<SingleRange componentId="ratingsfilter" dataField="download" title="Filter by Download Times"
				   data={[{ start: 0, label: '0 time and up' },
					   { start: 1, label: '1 times and up' }]}
				   defaultValue="0 time and up" showRadio/>

		{/*result*/}
		<ReactiveList componentId="results" dataField="_score" size={6} pagination={true}
					  react={{
					  	and: ["searchbox", "creatorfilter", "ratingsfilter"]
					  }}
					  render={({ data }) => (
							<ReactiveList.ResultCardsWrapper>
							{data.map((item) => (
								<ResultCard key={item.file_id}>
								<ResultCard.Title
									dangerouslySetInnerHTML={{
									__html: item.name
									}}
								/>
								<ResultCard.Description>
									{`created by ${item.creator} at ${parseDate(item.created)}`}
								</ResultCard.Description>
								<ResultCard.Description>
									{`Downloaded ${item.download} times.`}
								</ResultCard.Description>
								</ResultCard>
								))}
							</ReactiveList.ResultCardsWrapper>
							)}/>
    </ReactiveBase>
  );
}
