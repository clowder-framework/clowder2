import React from "react";
import {
	ReactiveBase,
	DataSearch,
	MultiList,
	SingleRange,
	ReactiveList,
	ResultCard,
	MultiDropdownList, SingleDropdownRange
} from "@appbaseio/reactivesearch";
import {parseDate} from "../../utils/common";
import {Grid} from "@mui/material";
import Layout from "../Layout";
import {searchTheme} from "../../theme";
import Cookies from "universal-cookie";
import {FilesTableFileEntry} from "../files/FilesTableFileEntry";
import TableBody from "@mui/material/TableBody";
import Table from "@mui/material/Table";
import Paper from "@mui/material/Paper";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
const cookies = new Cookies();

export function SearchFile() {
	// @ts-ignore
	return (
		<Layout>
			<div className="outer-container">
				<Grid container spacing={4}>
					<Grid item xs>
						<ReactiveBase
						  url="http://localhost:8000/api/v2/elasticsearch"
						  app="file"
						  headers={{"Authorization": cookies.get("Authorization")}}
						  theme={searchTheme}
						>
							{/*search*/}
							<DataSearch
								componentId="searchbox"
								title="Search for File"
								autosuggest={true}
								highlight={true}
								queryFormat="or"
								fuzziness={0}
								debounce={100}
								react={{ and: ["creatorfilter",
										"downloadfilter"]}}
								// apply react to the filter
								URLParams={true}
								showFilter={true}
								showClear
								renderNoSuggestion="No suggestions found."
								dataField={[
											{field: "name", weight: 3},
											{field:"creator.keyword", weight:1}
											]}
								innerClass={{
									title: "search-title",
									input: "search-input",
								}}
							/>

							{/*filters*/}
							<Grid container spacing={2} sx={{marginBottom: "20px"}}>
								<Grid item xs={12} sm={6} md={6} lg={6}>
									<MultiDropdownList
										componentId="creatorfilter"
										dataField="creator"
										size={5}
										sortBy="count"
										showCount={true}
										placeholder="Creator: All"
										innerClass={{
											select: "filter-select"
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={6} md={6} lg={6}>
									<SingleDropdownRange
										componentId="downloadfilter"
										dataField="download"
										data={[{ start: 0, label: "0 time and up" },
											   { start: 10, label: "10 times and up" },
											   { start: 100, label: "100 times and up" },
										]}
										placeholder="Download Times: All"
										innerClass={{
											select: "filter-select"
										}}
									/>
								</Grid>
							</Grid>

							{/*result*/}
							<ReactiveList componentId="results" dataField="_score" size={20} pagination={true}
									  react={{
										and: ["searchbox", "creatorfilter", "downloadfilter"]
									  }}
									  render={({ data }) => (
												<TableContainer component={Paper}>
													<Table sx={{ minWidth: 650 }} aria-label="simple table">
														<TableHead>
															<TableRow>
																<TableCell>Name</TableCell>
																<TableCell align="right">Updated</TableCell>
																<TableCell align="right">Size</TableCell>
																<TableCell align="right">Type</TableCell>
																<TableCell align="right"></TableCell>
															</TableRow>
														</TableHead>
														<TableBody>
															{data.map((file) => (
																	<FilesTableFileEntry
																		// selectFile={}
																		file={file}
																	/>
																))}
														</TableBody>
													</Table>
												</TableContainer>
										)}/>

						</ReactiveBase>
					</Grid>
				</Grid>
			</div>
		</Layout>
  );
}
