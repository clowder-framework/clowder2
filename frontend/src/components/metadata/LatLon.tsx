import React, {useState} from "react";
import {TextField, Typography} from "@mui/material";

export const LatLon = (props) => {
	const {widgetName, key, contents, readOnly} = props;
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");
	const id = `lat-lon-${key}`;

	return (
		<>
			<Typography>{widgetName}</Typography>
			<TextField label="Lat" variant="outlined" margin="normal"
					   fullWidth id={id}
					   name={widgetName}
					   value={readOnly? contents.latitude: lat}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLat(event.target.value);}}
					   disabled={readOnly ? true: false}
			/>
			<TextField label="Lon" variant="outlined" margin="normal"
					   fullWidth id={id}
					   name={widgetName}
					   value={readOnly? contents.longitude: lon}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLon(event.target.value);}}
					   disabled={readOnly ? true: false}
			/>
		</>
	)
}
