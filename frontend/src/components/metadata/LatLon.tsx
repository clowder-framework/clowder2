import React, {useState} from "react";
import {Button, TextField, Typography} from "@mui/material";

export const LatLon = (props) => {

	const {widgetName, metadataId, contents, saveMetadata, resourceId} = props;
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");
	const [readOnly, setReadOnly] = useState(!!contents);

	const resetForm = () => {
		setLat("");
		setLon("");
	}

	return (
		<>
			<TextField label="Lat" variant="outlined" margin="normal"
					   fullWidth
					   name={widgetName}
					   value={readOnly? contents.latitude: lat}
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
			{
				readOnly ?
					<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(false);}}>Edit</Button>
					:
					<>
						{/*<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(true);}}>Cancel</Button>*/}
						<Button variant="contained" sx={{float:"right"}} onClick={() => {
							// update metadata
							saveMetadata(resourceId, {
								"id":metadataId,
								"definition": widgetName,
								"contents": {
									"latitude":lat,
									"longitude":lon
								}});
							resetForm();
							setReadOnly(true);
						}}>Save</Button>
					</>
			}
		</>
	)
}
