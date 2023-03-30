import React, {useEffect, useState} from "react";
import {
	Autocomplete,
	Box,
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField
} from "@mui/material";
import {addGroupMember} from "../../actions/group";
import {useDispatch, useSelector} from "react-redux";
import {fetchAllUsers} from "../../actions/user";
import {RootState} from "../../types/data";
import {UserOut} from "../../openapi/v2";
import GroupsIcon from "@mui/icons-material/Groups";


type AddMemberModalProps = {
    open: boolean,
    handleClose: any,
    groupName: string
}

export default function AddMemberModal(props: AddMemberModalProps) {
    const { open, handleClose, groupName } = props;

    const dispatch = useDispatch();
    const listAllUsers = (skip:number, limit:number) => dispatch(fetchAllUsers(skip, limit));
    const groupMemberAdded = (groupId:string | undefined, username: string | undefined) => dispatch(addGroupMember(groupId, username));
    const users = useSelector((state: RootState) => state.group.users);

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [options, setOptions] = useState([]);

	useEffect(() => {
		listAllUsers(0, 21);
	}, [])

	useEffect(() =>{
		setOptions(users.reduce((list:string[], user:UserOut) => { return [...list, user.email];}, []));
	}, [users])

    return (
        <Container>
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth="md"
                sx={{
                    ".MuiPaper-root": {
                        padding: "2em",
                    },
                }}>
                <DialogTitle>Add People to <GroupsIcon sx={{verticalAlign: "middle", fontSize: "1.5em",
					margin: "auto 5px"}}/>{groupName}</DialogTitle>
                <DialogContent>
                    <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <Autocomplete
                            id="email-auto-complete"
                            freeSolo
                            autoHighlight
                            inputValue={email}
                            onInputChange={(_, value) => {
                                setEmail(value)
                            }}
                            options={options}
                            renderInput={(params) =>
								<TextField {...params}
										   sx={{mt: 1, width: 600 }}
										   required label="Enter email address" />}
                        />
                        AS
                        <FormControl variant="outlined" sx={{mt:1, minWidth: 150 }}>
                            <InputLabel id="demo-simple-select-label">Status</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={role}
                                defaultValue={"viewer"}
                                label="Status"
                                onChange={(event, _) => {
                                    setRole(event.target.value)
                                }}
                            >
                                <MenuItem value="owner">Owner</MenuItem>
                                <MenuItem value="editor">Editor</MenuItem>
                                <MenuItem value="uploader">Uploader</MenuItem>
                                <MenuItem value="viewer">Viewer</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Button variant="contained" sx={{ marginTop: 1 }}
							onClick={handleClose}
							disabled={(email.length > 0) ? false : true}>
						Add
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
