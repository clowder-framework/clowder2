import React, {useEffect, useState} from "react";

export default function File(props){
	const {listFileMetadata, fileMetadata, listFileExtractedMetadata, fileExtractedMetadata, ...other} = props;

	// component did mount
	useEffect(() => {
		listFileMetadata();
		listFileExtractedMetadata();
	}, []);

	return (
		// metadata
		<div>
			{/*<h1>*/}
			{/*	{fileMetadata["filename"]}*/}
			{/*</h1>*/}
			{/*<p>{fileMetadata["content-type"]}</p>*/}
			{/*<p>{fileMetadata["data-created"]}</p>*/}
			{/*<p>{fileMetadata["authorId"]}</p>*/}
			{/*<p>{fileMetadata["filedescription"]}</p>*/}
			{/*<p>{fileMetadata["id"]}</p>*/}
			{/*<p>{fileMetadata["size"]}</p>*/}
			{/*<p>{fileMetadata["status"]}</p>*/}
			{/*<p>{fileMetadata["thumbnail"]}</p>*/}
		</div>
	);
}
