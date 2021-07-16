import React, {useEffect, useState} from "react";
import config from "../app.config";

export default function File(props){
	const {
		listFileMetadata, fileMetadata,
		listFileExtractedMetadata, fileExtractedMetadata,
		listFileMetadataJsonld, fileMetadataJsonld,
		...other} = props;


	// component did mount
	useEffect(() => {
		listFileMetadata();
		listFileExtractedMetadata();
		listFileMetadataJsonld();

		//
		// attach previwer
		const script = document.createElement('script');
		script.src = "../public/previewers/thumbnail/thumbnail-previewer.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		}
	}, []);

	const Configuration = {};
	Configuration.tab = "#previewer";
	Configuration.url = "https://clowder.ncsa.illinois.edu/clowder/api/previews/576b53afe4b0e899329e8b9c";
	Configuration.fileid = "576b53afe4b0e899329e8b9c";
	Configuration.previewer = ".";
	Configuration.fileType = "image/png";
	Configuration.APIKEY=config.apikey;
	Configuration.authenticated = true;

	return (
		<div>
			<h4>metadata</h4>
			<div>
				<h1>
					{fileMetadata["filename"]}
				</h1>
				<p>{fileMetadata["content-type"]}</p>
				<p>{fileMetadata["data-created"]}</p>
				<p>{fileMetadata["authorId"]}</p>
				<p>{fileMetadata["filedescription"]}</p>
				<p>{fileMetadata["id"]}</p>
				<p>{fileMetadata["size"]}</p>
				<p>{fileMetadata["status"]}</p>
				<p>{fileMetadata["thumbnail"]}</p>
			</div>
			<h4>metadata jsonld</h4>
			<div>
				{
					fileMetadataJsonld.map((item) => {
						return Object.keys(item["content"]).map((key) => {
							return (<p>{key} - {JSON.stringify(item["content"][key])}</p>);
							}
						);
					})
				}
			</div>
			<h4>previewer</h4>
			<div id="previewer" data-configuration={JSON.stringify(Configuration)}></div>
		</div>
	);
}
