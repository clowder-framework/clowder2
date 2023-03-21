import React, { useState } from "react";
import { Autocomplete, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";


type ChangeRoleModalProps = {
    open: boolean,
    handleClose: any,
	datasetId: string,
}

export default function ChangeRoleModal(props: ChangeRoleModalProps) {
    const { open, handleClose, datasetId } = props;
    const datasetName = "noname";

    const [email, setEmail] = useState("")
    const [role, setRole] = useState("viewer")

    const onShare = () => {
        handleClose();
    }

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
                    <Typography>Invite people to collaborate</Typography>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Autocomplete
                            id="email-auto-complete"
                            freeSolo
                            autoHighlight
                            inputValue={email}
                            onInputChange={(event, value) => {
                                setEmail(value)
                            }}
                            options={["abc@xyz.com"]}
                            renderInput={(params) => <TextField {...params} sx={{ mt: 1, mr: 1, "alignItems": "right", "width": "450px" }} required label="Enter email address" />}
                        /> as
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
                    <Button variant="contained" sx={{ marginTop: 1 }} onClick={onShare} disabled={(email.length > 0) ? false : true}>Share</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
