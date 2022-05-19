import React, {useState} from "react";
import {TextField} from "@mui/material";

export const LatLon = (props) => {
	const {widgetName, key} = props;
	const [lat, setLat] = useState("");
	const [lon, setLon] = useState("");
	const id = `lat-lon-${key}`;

	return (
		<>
			<TextField label="Lat" variant="outlined" margin="normal"
					   fullWidth id={id}
					   name={widgetName}
					   value={lat}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLat(event.target.value);}}/>
			<TextField label="Lon" variant="outlined" margin="normal"
					   fullWidth id={id}
					   name={widgetName}
					   value={lon}
					   onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setLon(event.target.value);}}/>
		</>
	)
}
