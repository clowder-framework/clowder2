import React from "react";
import { Typography } from "@material-ui/core";

export default function Thumbnail(props){
	const {fileId, imgSrc, fileType, ...other} = props;
	return (
		(() => {
			if (fileType === "image/jpeg" || fileType === "image/jpg" || fileType === "image/png"
				|| fileType === "image/gif" || fileType === "image/bmp"){
				return <img className="rubberbandimage" src={imgSrc} alt="img" id={`rubberbandCanvas-${fileId}`}/>;
			}
			else if (fileType === "image/tiff"){
				return <embed alt="No plugin capable of displaying TIFF images was found."
							  width={750} height={550} src={imgSrc} type="image/tiff" negative="no" id="embedded" />;
			}
			else{
				return <Typography>ERROR: Unrecognised image format.</Typography>;
			}

		})()
	)
}
