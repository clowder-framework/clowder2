import React, {useEffect, useState} from "react";

import {useDispatch, useSelector} from "react-redux";
import { Autocomplete, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import {fetchGroups} from "../../actions/group";
import {RootState} from "../../types/data";
import {setDatasetGroupRole} from "../../actions/dataset";
import {useParams} from "react-router-dom";

type ShareGroupDatasetModalProps = {
    open: boolean,
    handleClose: any,
    datasetName: string
}

export default function ShareGroupDatasetModal(props: ShareGroupDatasetModalProps) {
    const { open, handleClose, datasetName } = props;
	const {datasetId} = useParams<{ datasetId?: string }>();
    const [role, setRole] = useState("viewer");
	const [group, setGroup] = useState("");
	const dispatch = useDispatch();
	const listGroups = () => dispatch(fetchGroups(0, 21));
	const groups = useSelector((state: RootState) => state.group.groups);
	const setGroupRole = (datasetId: string , groupId: string, role: string) => dispatch(setDatasetGroupRole(datasetId, groupId, role));


	// component did mount
	useEffect(() => {
		listGroups();
	}, []);

    const onShare = () => {
    	console.log(group, datasetId,role);
        handleClose();
    }



	const options = Array();
    groups.map((group) => {
    	let group_option = {value:group.id, label:group.name}
		options.push(group_option);
    });
	console.log('group optioins are', options);
	console.log('it is of type', typeof(options));

	return (
        <Container>
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth="md"
                sx={{
                    '.MuiPaper-root': {
                        padding: "2em",
                    },
                }}>
                <DialogTitle>Share dataset &apos;{datasetName}&apos;</DialogTitle>
                <Divider />
                <DialogContent>
                    <Typography>Invite groups to collaborate</Typography>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>
						<FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="demo-simple-select-label">Group</InputLabel>
							<Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
								value={group}
								// defaultValue={"641214ebfe6405bc949730c6"}
								label="Group"
                                onChange={(event, value) => {
                                	console.log(event, value);
                                	console.log('chose a new group');
                                	console.log(event.target.value);
                                    setGroup(event.target.value);
                                }}
                            	>
							{options.map((group) => (
            					<MenuItem
								  key={group.label}
								  value={group.value}
								>
								  {group.label}
            					</MenuItem>
							))}
                            </Select>
						</FormControl>
                        <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-label">Status</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={role}
                                defaultValue={"viewer"}
                                label="Status"
                                onChange={(event, value) => {
                                	console.log(event, value);
                                    setRole(event.target.value)
                                }}
                            >
                                <MenuItem value="owner">Owner</MenuItem>
                                <MenuItem value="editor">Editor</MenuItem>
                                <MenuItem value="uploader">Uploader</MenuItem>
                                <MenuItem value="viewer">Viewer</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <Button variant="contained" sx={{ marginTop: 1 }} onClick={onShare} disabled={(group.length > 0) ? false : true}>Share</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
