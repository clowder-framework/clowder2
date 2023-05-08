import React, { useEffect } from "react";
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useNavigate,
	useParams,
} from "react-router-dom";

import { CreateMetadataDefinitionPage } from "./components/metadata/CreateMetadataDefinition";
import { Dataset as DatasetComponent } from "./components/datasets/Dataset";
import { File as FileComponent } from "./components/files/File";
import { CreateDataset } from "./components/datasets/CreateDataset";
import { Groups as GroupListComponent } from "./components/groups/Groups";
import { Group as GroupComponent } from "./components/groups/Group";

import { RedirectRegister as RedirectRegisterComponent } from "./components/auth/RedirectRegister";
import { Auth as AuthComponent } from "./components/auth/Auth";
import { RedirectLogin as RedirectLoginComponent } from "./components/auth/RedirectLogin";
import { RedirectLogout as RedirectLogoutComponent } from "./components/auth/RedirectLogout";
import { Search } from "./components/search/Search";
import { isAuthorized } from "./utils/common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./types/data";
import { resetLogout } from "./actions/common";
import { Explore } from "./components/Explore";
import { ExtractionHistory } from "./components/listeners/ExtractionHistory";
import { fetchDatasetRole, fetchFileRole } from "./actions/authorization";
import { PageNotFound } from "./components/errors/PageNotFound";
import { Forbidden } from "./components/errors/Forbidden";
import { ApiKeys } from "./components/ApiKeys/ApiKey";
import {Profile}  from "./components/users/Profile";
// https://dev.to/iamandrewluca/private-route-in-react-router-v6-lg5
const PrivateRoute = (props): JSX.Element => {
	const { children } = props;

	const history = useNavigate();

	const dispatch = useDispatch();
	const loggedOut = useSelector((state: RootState) => state.error.loggedOut);
	const reason = useSelector((state: RootState) => state.error.reason);
	const dismissLogout = () => dispatch(resetLogout());

	const listDatasetRole = (datasetId: string | undefined) =>
		dispatch(fetchDatasetRole(datasetId));
	const listFileRole = (fileId: string | undefined) =>
		dispatch(fetchFileRole(fileId));
	const { datasetId } = useParams<{ datasetId?: string }>();
	const { fileId } = useParams<{ fileId?: string }>();

	// log user out if token expired/unauthorized
	useEffect(() => {
		if (loggedOut) {
			// reset loggedOut flag so it doesn't stuck in "true" state, then redirect to login page
			dismissLogout();
			history("/auth/login");
		}
	}, [loggedOut]);

	// not found or unauthorized
	useEffect(() => {
		if (reason == "Forbidden") {
			history("/forbidden");
		} else if (reason == "Not Found") {
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

	return <>{isAuthorized() ? children : <Navigate to="/auth/login" />}</>;
};

export const AppRoutes = (): JSX.Element => {
	return (
		<BrowserRouter>
			<Routes>
				<Route
					path="/"
					element={
						<PrivateRoute>
							<Explore />
						</PrivateRoute>
					}
				/>
				<Route
					path="/profile"
					element={
						<PrivateRoute>
							<Profile />
						</PrivateRoute>
					}
				/>
				<Route
					path="/apikeys"
					element={
						<PrivateRoute>
							<ApiKeys />
						</PrivateRoute>
					}
				/>
				<Route
					path="/new-metadata-definition"
					element={
						<PrivateRoute>
							<CreateMetadataDefinitionPage />
						</PrivateRoute>
					}
				/>
				<Route
					path="/create-dataset/"
					element={
						<PrivateRoute>
							<CreateDataset />
						</PrivateRoute>
					}
				/>
				<Route
					path="/datasets/:datasetId"
					element={
						<PrivateRoute>
							<DatasetComponent />
						</PrivateRoute>
					}
				/>
				<Route
					path="/files/:fileId"
					element={
						<PrivateRoute>
							<FileComponent />
						</PrivateRoute>
					}
				/>
				<Route path="/auth/register" element={<RedirectRegisterComponent />} />
				<Route path="/auth/login" element={<RedirectLoginComponent />} />
				<Route path="/auth/logout" element={<RedirectLogoutComponent />} />
				<Route
					path="/groups"
					element={
						<PrivateRoute>
							<GroupListComponent />
						</PrivateRoute>
					}
				/>
				<Route
					path="/groups/:groupId"
					element={
						<PrivateRoute>
							<GroupComponent />
						</PrivateRoute>
					}
				/>
				<Route path="/auth" element={<AuthComponent />} />
				<Route
					path="/search"
					element={
						<PrivateRoute>
							<Search />
						</PrivateRoute>
					}
				/>
				<Route
					path="/extractions"
					element={
						<PrivateRoute>
							<ExtractionHistory />
						</PrivateRoute>
					}
				/>
				<Route
					path="/forbidden"
					element={
						<PrivateRoute>
							<Forbidden />
						</PrivateRoute>
					}
				/>
				<Route
					path="*"
					element={
						<PrivateRoute>
							<PageNotFound />
						</PrivateRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
};
