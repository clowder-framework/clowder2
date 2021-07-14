import React, {useEffect, useState} from "react";

export default function File(props){
	const {listFileMetadata, fileMetadata, ...other} = props;

	// component did mount
	useEffect(() => { listFileMetadata();}, []);
	return (
		<div >
			{fileMetadata}
		</div>
	);
}
