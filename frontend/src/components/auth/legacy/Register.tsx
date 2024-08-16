import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
	Avatar,
	Button,
	Link,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useDispatch, useSelector } from "react-redux";
import { _legacy_registerregister as registerAction } from "../../../actions/user";
import { RootState } from "../../../types/data";

export const Register = (): JSX.Element => {
	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	const dispatch = useDispatch();
	const register = (
		email: string,
		password: string,
		firstname: string,
		lastname: string
	) => dispatch(registerAction(email, password, firstname, lastname));
	const registerSucceeded = useSelector(
		(state: RootState) => state.user.registerSucceeded
	);
	const errorMsg = useSelector((state: RootState) => state.user.errorMsg);

	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [passwordErrorText, setPasswordErrorText] = useState("");
	const [passwordConfirmErrorText, setPasswordConfirmErrorText] = useState("");
	const [promptError, setPromptError] = useState(false);

	useEffect(() => {
		if (registerSucceeded) history("/auth/login");
	}, [registerSucceeded]);

	const changeFirstname = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFirstname(event.target.value);
	};

	const changeLastname = (event: React.ChangeEvent<HTMLInputElement>) => {
		setLastname(event.target.value);
	};

	const changeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(event.target.value);
	};

	const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
		const pw = event.target.value;

		if (pw.length <= 6) {
			setPromptError(true);
			setPasswordErrorText("Your password must be at least 6 characters long");
		} else {
			setPromptError(false);
			setPasswordErrorText("");
		}

		setPassword(pw);
	};

	const changePasswordConfirm = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const pw = event.target.value;

		if (pw !== password) {
			setPromptError(true);
			setPasswordConfirmErrorText("Your password confirmation does not match!");
		} else {
			setPromptError(false);
			setPasswordConfirmErrorText("");
		}

		setPasswordConfirm(pw);
	};

	const handleRegisterButtonClick = async () => {
		if (password === passwordConfirm) {
			await register(email, password, firstname, lastname);
		} else {
			setPasswordConfirmErrorText("The password confirmation does not match!");
		}
	};

	return (
		<div>
			<div
				className="center"
				style={{
					display: "block",
					margin: "auto",
					width: "500px",
					paddingTop: "10%",
				}}
			>
				<Paper style={{ padding: 40 }}>
					<Avatar style={{ margin: "auto" }}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						Register
					</Typography>
					<Typography sx={{ color: "red" }}>{errorMsg}</Typography>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						autoFocus
						id="firstname"
						label="First Name"
						name="firstname"
						value={firstname}
						onChange={changeFirstname}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="lastname"
						label="Last Name"
						name="lastname"
						value={lastname}
						onChange={changeLastname}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="email"
						label="Email"
						name="email"
						value={email}
						onChange={changeEmail}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="password"
						label="Password"
						name="password"
						type="password"
						error={promptError}
						helperText={passwordErrorText}
						value={password}
						onChange={changePassword}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="password-confirm"
						label="Password Confirmation"
						name="password-confirm"
						type="password"
						error={promptError}
						helperText={passwordConfirmErrorText}
						value={passwordConfirm}
						onChange={changePasswordConfirm}
					/>
					<Link
						component={RouterLink}
						to="#"
						sx={{
							display: "block",
							textAlign: "right",
							margin: "0 auto 10px auto",
						}}
						target="_blank"
					>
						Forgot password?
					</Link>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						onClick={handleRegisterButtonClick}
						disabled={!(password === passwordConfirm && password !== "")}
					>
						Register
					</Button>
					<Link
						component={RouterLink}
						to="/login"
						sx={{
							fontWeight: 500,
							fontSize: "15px",
							display: "block",
							margin: "10px auto 5px auto",
						}}
					>
						Already have an account? Log In.
					</Link>
				</Paper>
			</div>
		</div>
	);
};
