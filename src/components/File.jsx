import React, {useEffect, useState} from "react";
import config from "../app.config";

export default function File(props){
	const {
		listFileMetadata, fileMetadata,
		listFileExtractedMetadata, fileExtractedMetadata,
		listFileMetadataJsonld, fileMetadataJsonld,
		listFilePreviews, filePreviews,
		...other} = props;


	// // component did mount
	// useEffect(() => {
	// 	// listFileMetadata();
	// 	// listFileExtractedMetadata();
	// 	// listFileMetadataJsonld();
	// 	// listFilePreviews();
	// }, []);

	useEffect(() => {
		if (filePreviews.length > 0 && filePreviews[0].previews !== undefined){
			// attach previwer jquery
			const script = document.createElement('script');

			// look at which previewer to load
			filePreviews[0].previews.map((filePreview, index)=> {
				script.src = `../public${filePreview["p_path"]}/${filePreview["p_main"]}`;;
				script.async = true;
				document.body.appendChild(script);
				// return () => {
				// 	document.body.removeChild(script);
				// }
			});
		}
	}, [filePreviews])

	const selectFile = (fileId) =>{
		listFileMetadata(fileId);
		listFileExtractedMetadata(fileId);
		listFileMetadataJsonld(fileId);
		listFilePreviews(fileId);
	}

	return (
		<div>
			<select name="files" id="files" onChange={(e)=>{ selectFile(e.target.value);}} defaultValue="select">
				<option value="select" disabled>Select A File</option>
				<option value="60ee082d5e0e3ff9d746b5fc">Text File</option>
				<option value="59933ae8e4b04cf488f47aba">PDF</option>
				<option value="59933ae9e4b04cf488f47b48">Video</option>
				<option value="5d974f435e0eb9edf7b3cf00">Audio</option>
				<option value="576b0b1ce4b0e899329e8553">Image</option>
				<option value="60ee08325e0e3ff9d746bc57">Three D</option>
			</select>
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
			<h4 id="preview">previewer</h4>
			{
				filePreviews.length > 0 && filePreviews[0].previews !== undefined
					?
					filePreviews[0].previews.map((filePreview, index)=> {
						const Configuration = {};
						Configuration.tab = `#previewer_${filePreviews[0]["file_id"]}_${index}`;
						Configuration.url = `${config.hostname}${filePreview["pv_route"]}?superAdmin=true`;
						Configuration.fileid = filePreview["pv_id"];
						Configuration.previewer = `/public${filePreview["p_path"]}/`;
						Configuration.fileType = filePreview["pv_contenttype"];
						Configuration.APIKEY=config.apikey;
						Configuration.authenticated = true;
						// Configuration.metadataJsonld = fileMetadataJsonld;

						let previewId = filePreview["p_id"].replace(" ","-").toLowerCase();
						return (<div className={`configuration ${previewId}`} data-configuration={JSON.stringify(Configuration)}>
							<div id={Configuration.tab.slice(1)}></div>
						</div>);
					})
					:
					<></>
			}

		</div>
	);
}
