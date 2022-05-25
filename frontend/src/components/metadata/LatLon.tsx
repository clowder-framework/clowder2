import React, {useState} from "react";
import {Button, TextField, Typography} from "@mui/material";
import {MetadataButtonGroup} from "./MetadataButtonGroup";

export const LatLon = (props) => {

	const {widgetName, metadataId, contents, saveMetadata, resourceId} = props;
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");
	const [readOnly, setReadOnly] = useState(!!metadataId); // if metdataID doesn't exist meaning it's a new form

	const resetForm = () => {
		setLat("");
		setLon("");
	}

	return (
		<>
			<TextField label="Lat" variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly && contents? contents.latitude: lat}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLat(event.target.value);}}
					   disabled={readOnly}
					   sx={{background:"#ffffff"}}
			/>
			<TextField label="Lon" variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly? contents.longitude: lon}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLon(event.target.value);}}
					   disabled={readOnly}
					   sx={{background:"#ffffff"}}
			/>
			<MetadataButtonGroup readOnly={readOnly}
								 setReadOnly={setReadOnly}
								 metadataId={metadataId}
								 saveMetadata={saveMetadata}
								 resourceId={resourceId}
								 contents={{
									 "latitude":lat,
									 "longitude":lon
								 }}
								 resetForm={resetForm}
								 widgetName={widgetName}
			/>
		</>
	)
}
