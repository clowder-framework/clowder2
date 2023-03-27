import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import { Autocomplete, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import {fetchGroups} from "../../actions/group";
import {RootState} from "../../types/data";
import {parseDate} from "../../utils/common";


type ShareGroupDatasetModalProps = {
    open: boolean,
    handleClose: any,
    datasetName: string
}

export default function ShareGroupDatasetModal(props: ShareGroupDatasetModalProps) {
    const { open, handleClose, datasetName } = props;

    const [group, setGroup] = useState("")
    const [role, setRole] = useState("viewer")
	const dispatch = useDispatch();
	const listGroups = () => dispatch(fetchGroups(0, 21));
	const groups = useSelector((state: RootState) => state.group.groups);

	// component did mount
	useEffect(() => {
		listGroups();
	}, []);

    const onShare = () => {
        handleClose();
    }
	console.log('groups are here', groups);


	const group_options = [];
    groups.map((group) => {
    	let group_option = {value:group.id, label:group.name}
		group_options.push(group_option);
    });
	console.log('group optioins are', group_options);
	console.log('it is of type', typeof(group_options));
	const initial_group = group_options.at(0);
	console.log('initial group is', initial_group);
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
                        <Autocomplete
                            id="email-auto-complete"
                            freeSolo
                            autoHighlight
                            inputValue={group}
                            onInputChange={(event, value) => {
                                setGroup(value)
                            }}
                            options={["abc@xyz.com"]}
                            renderInput={(params) => <TextField {...params} sx={{ mt: 1, mr: 1, "alignItems": "right", "width": "450px" }} required label="Enter email address" />}
                        /> as
						<Select
								options={group_options}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Status"
                                onChange={(event, value) => {
                                    setGroup(event.target.value)
                                }}
                            >
                            </Select>
                        <FormControl variant="outlined" sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-label">Status</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={role}
                                defaultValue={"viewer"}
                                label="Status"
                                onChange={(event, value) => {
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
