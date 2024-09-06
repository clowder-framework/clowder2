import React, {useEffect} from "react";
import {BrowserRouter, Navigate, Route, Routes, useNavigate, useParams,} from "react-router-dom";
import {Dataset as DatasetComponent} from "./components/datasets/Dataset";
import {PublicDataset as PublicDatasetComponent} from "./components/datasets/PublicDataset";
import {File as FileComponent} from "./components/files/File";
import {PublicFile as PublicFileComponent} from "./components/files/PublicFile";
import {CreateDataset} from "./components/datasets/CreateDataset";
import {Groups as GroupListComponent} from "./components/groups/Groups";
import {Group as GroupComponent} from "./components/groups/Group";
import {Projects} from "./components/projects/Projects";
import {Project} from "./components/projects/Project";

import {RedirectRegister as RedirectRegisterComponent} from "./components/auth/RedirectRegister";
import {Auth as AuthComponent} from "./components/auth/Auth";
import {RedirectLogin as RedirectLoginComponent} from "./components/auth/RedirectLogin";
import {RedirectLogout as RedirectLogoutComponent} from "./components/auth/RedirectLogout";
import {Search} from "./components/search/Search";
import {PublicSearch} from "./components/search/PublicSearch";
import {isAuthorized} from "./utils/common";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "./types/data";
import {refreshToken, resetFailedReason, resetFailedReasonInline, resetLogout,} from "./actions/common";
import {Explore} from "./components/Explore";
import {Public} from "./components/Public";
import {ExtractionHistory} from "./components/listeners/ExtractionHistory";
import {fetchDatasetRole, fetchFileRole} from "./actions/authorization";
import {PageNotFound} from "./components/errors/PageNotFound";
import {Forbidden} from "./components/errors/Forbidden";
import {ApiKeys} from "./components/apikeys/ApiKey";
import {Profile} from "./components/users/Profile";
import {ManageUsers} from "./components/users/ManageUsers";
import config from "./app.config";
import {MetadataDefinitions} from "./components/metadata/MetadataDefinitions";
import {MetadataDefinitionEntry} from "./components/metadata/MetadataDefinitionEntry";
import {Feeds} from "./components/listeners/Feeds";
import {AllListeners} from "./components/listeners/AllListeners";
import {FeedEntry} from "./components/listeners/FeedEntry";

// https://dev.to/iamandrewluca/private-route-in-react-router-v6-lg5
const PrivateRoute = (props): JSX.Element => {
	const {children} = props;

	const history = useNavigate();

	const dispatch = useDispatch();

	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);
	const reason = useSelector((state: RootState) => state.error.reason);
	const dismissLogout = () => dispatch(resetLogout());

	const listDatasetRole = (datasetId: string | undefined) =>
		dispatch(fetchDatasetRole(datasetId));
	const listFileRole = (fileId: string | undefined) =>
		dispatch(fetchFileRole(fileId));
	const {datasetId} = useParams<{ datasetId?: string }>();
	const {fileId} = useParams<{ fileId?: string }>();

	// periodically call login endpoint once logged in
	useEffect(() => {
		// Call the refreshToken function immediately
		refreshToken(dispatch, null);

		// Call the refreshToken function every minute
		const intervalId = setInterval(refreshToken, config.refreshTokenInterval);

		// Clean up the interval when the component is unmounted
		return () => clearInterval(intervalId);
	}, []);

	// log user out if token expired/unauthorized
	useEffect(() => {
		if (loggedOut) {
			// reset loggedOut flag so it doesn't stuck in "true" state, then redirect to login page
			dismissLogout();
			history("/auth/login");
		}
	}, [loggedOut]);

	// not found or unauthorized redirect
	useEffect(() => {
		if (reason == "Forbidden") {
			// if redirect to new page, reset error so the error modal/message doesn't stuck in "Forbidden" state
			dispatch(resetFailedReason());
			dispatch(resetFailedReasonInline());
			history("/forbidden");
		} else if (reason == "Not Found") {
			// if redirect to new page, reset error so the error modal/message doesn't stuck in "Forbidden" state
			dispatch(resetFailedReason());
			dispatch(resetFailedReasonInline());
			history("/not-found");
		}
	}, [reason]);

	// get roles if authorized
	useEffect(() => {
		if (datasetId && reason === "") listDatasetRole(datasetId);
	}, [datasetId, reason]);

	useEffect(() => {
		if (fileId && reason === "") listFileRole(fileId);
	}, [fileId, reason]);

	return <>{isAuthorized() ? children : <Navigate to="/public"/>}</>;
};

export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/public" element={<Public/>}/>
				{isAuthorized() ? (
					<Route
						path="/"
						element={
							<PrivateRoute>
								<Explore/>
							</PrivateRoute>
						}
					/>
				) : (
					<Route path="/public" element={<Public/>}/>
				)}
				<Route
					path="/projects"
					element={
						<PrivateRoute>
							<Projects/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/projects/:projectId"
					element={
						<PrivateRoute>
							<Project/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/profile"
					element={
						<PrivateRoute>
							<Profile/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/manage-users"
					element={
						<PrivateRoute>
							<ManageUsers/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/apikeys"
					element={
						<PrivateRoute>
							<ApiKeys/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/metadata-definitions"
					element={
						<PrivateRoute>
							<MetadataDefinitions/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/metadata-definitions/:metadataDefinitionId"
					element={
						<PrivateRoute>
							<MetadataDefinitionEntry/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/create-dataset/"
					element={
						<PrivateRoute>
							<CreateDataset/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/datasets/:datasetId"
					element={
						<PrivateRoute>
							<DatasetComponent/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/public_datasets/:datasetId"
					element={<PublicDatasetComponent/>}
				/>
				<Route
					path="/files/:fileId"
					element={
						<PrivateRoute>
							<FileComponent/>
						</PrivateRoute>
					}
				/>
				<Route path="/public_files/:fileId" element={<PublicFileComponent/>}/>
				<Route path="/auth/register" element={<RedirectRegisterComponent/>}/>
				<Route path="/auth/login" element={<RedirectLoginComponent/>}/>
				<Route path="/auth/logout" element={<RedirectLogoutComponent/>}/>
				<Route
					path="/groups"
					element={
						<PrivateRoute>
							<GroupListComponent/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/groups/:groupId"
					element={
						<PrivateRoute>
							<GroupComponent/>
						</PrivateRoute>
					}
				/>
				<Route path="/auth" element={<AuthComponent/>}/>
				<Route
					path="/search"
					element={
						<PrivateRoute>
							<Search/>
						</PrivateRoute>
					}
				/>
				<Route path="/public_search" element={<PublicSearch/>}/>
				<Route
					path="/extractions"
					element={
						<PrivateRoute>
							<ExtractionHistory/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/feeds"
					element={
						<PrivateRoute>
							<Feeds/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/feeds/:feedId"
					element={
						<PrivateRoute>
							<FeedEntry/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/listeners"
					element={
						<PrivateRoute>
							<AllListeners/>
						</PrivateRoute>
					}
				/>
				<Route
					path="/forbidden"
					element={
						<PrivateRoute>
							<Forbidden/>
						</PrivateRoute>
					}
				/>
				<Route
					path="*"
					element={
						<PrivateRoute>
							<PageNotFound/>
						</PrivateRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
};
