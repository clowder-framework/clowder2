import React, {useState} from "react";
import {Button, TextField, Typography} from "@mui/material";

export const LatLon = (props) => {
	const {widgetName, key, contents} = props;
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");
	const id = `lat-lon-${key}`;

	const [readOnly, setReadOnly] = useState(!!contents);
	return (
		<>
			<Typography>{widgetName}</Typography>
			<TextField label="Lat" variant="outlined" margin="normal"
					   fullWidth id={id}
					   name={widgetName}
					   value={readOnly? contents.latitude: lat}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLat(event.target.value);}}
					   disabled={readOnly}
			/>
			<TextField label="Lon" variant="outlined" margin="normal"
					   fullWidth id={id}
					   name={widgetName}
					   value={readOnly? contents.longitude: lon}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLon(event.target.value);}}
					   disabled={readOnly}
			/>
			{
				readOnly ?
					<Button variant="text" sx={{float:"right"}} onClick={() => {setReadOnly(false);}}>Edit</Button>
					:
					<Button variant="contained" sx={{float:"right"}} onClick={() => {
						// update metadata
						setReadOnly(true);
					}}>Save</Button>
			}

		</>
	)
}
