import React, {useEffect, useState} from "react";

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

		// attach previwer
		const script = document.createElement('script');
		script.src = "../public/thumbnail-previewer.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		}
	}, []);

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
		</div>
	);
}
