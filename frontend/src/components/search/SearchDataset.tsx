import React from "react";
import {ReactiveBase, DataSearch, MultiList, SingleRange, ReactiveList, ReactiveComponent} from "@appbaseio/reactivesearch";
import {parseDate} from "../../utils/common";

import Cookies from "universal-cookie";
import DatasetCard from "../datasets/DatasetCard";
import {Grid} from "@mui/material";
import Layout from "../Layout";
import theme from "../../theme";

const cookies = new Cookies();

const searchTheme = {
	typography: {
    	fontFamily: theme.typography.fontFamily,
    	fontSize: "16px",
	},
	colors: {
		textColor: theme.palette.secondary.dark,
		primaryTextColor: theme.palette.primary.contrastText,
		primaryColor: theme.palette.primary.main,
		titleColor: theme.palette.secondary.dark,
		alertColor: theme.palette.primary.dark,
		borderColor: theme.palette.primary.main,
		backgroundColor: theme.palette.primary.contrastText,
	}
};

export function SearchDataset() {
	// @ts-ignore
	return (
		<Layout>
			<div className="outer-container">
				<div className="inner-container">
					<Grid container spacing={4}>
						<Grid item xs>
							<ReactiveBase
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
								<DataSearch
									title="Search for Dataset"
									componentId="searchbox"
											autosuggest={true}
											highlight={true}
											queryFormat="or"
											fuzziness={0}
											debounce={100}
											react={{ and: ["creatorfilter",
													"downloadfilter",
													"modifyfilter"]}}
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
												title: 'search-title',
												input: 'search-input'
											}}
								/>

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
								<ReactiveList componentId="results" dataField="_score" size={20} pagination={true}
											  react={{
												and: ["searchbox", "creatorfilter", "downloadfilter", "modifyfilter"]
											  }}
											  render={({ data }) => (
													<Grid container spacing={2}>
														{data.map((item) => (
															<Grid item key={item._id} xs={12} sm={6} md={4} lg={3}>
																<DatasetCard id={item._id} name={item.name} author={item.author}
																			 created={parseDate(item.created)} description={item.description}/>
															</Grid>
															))}
													</Grid>
													)}/>
							</ReactiveBase>
						</Grid>
					</Grid>
				</div>
			</div>
		</Layout>
  );
}
