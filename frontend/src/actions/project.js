// import { V2 } from "../openapi";
// import { handleErrors } from "./common";

export const RECEIVE_PROJECTS = "RECEIVE_PROJECTS";

export function fetchProjects(skip = 0, limit = 12) {
	return (dispatch) => {
		dispatch({
			type: RECEIVE_PROJECTS,
			projects: {
				metadata: {
					total_count: 3,
					skip: skip,
					limit: limit,
				},
				data: [
					{
						id: "60f9f8c8c23f5c45d8f0e0e2",
						name: "Sample Project",
						description: "A description of the sample project",
						created: "2024-07-29T12:00:00Z",
						modified: "2024-07-29T12:00:00Z",
						dataset_ids: [
							"669ea731d559628438e5785d",
							"669ea746d559628438e5788f",
						],
						folder_ids: ["66a085640c20e43f5c50b059"],
						file_ids: ["669fcf4c78f3222201e18a0f"],
						creator: {
							id: "60f9f8c8c23f5c45d8f0e0c6",
							first_name: "Chen",
							last_name: "Wang",
							email: "cwang138@illinois.edu",
						},
					},
					{
						id: "60f9f8c8c23f5c45d8f0e0d1",
						name: "Sample Project 2",
						description: "A description of the second sample project",
						created: "2024-07-28T12:00:00Z",
						modified: "2024-07-28T12:00:00Z",
						dataset_ids: ["669fcf3978f3222201e18a0d"],
						folder_ids: [
							"66a085640c20e43f5c50b059",
							"66a80284cf77abbb78b4435f",
						],
						file_ids: ["669ea735d559628438e57865", "669ea733d559628438e57862"],
						creator: {
							id: "669ea726d559628438e57841",
							first_name: "Chen",
							last_name: "Wang",
							email: "cwang138@illinois.edu",
						},
					},
					{
						id: "60f9f8c8c23f5c45d8f0e0e2",
						name: "Sample Project 3",
						description: "A description of the third sample project",
						created: "2024-07-27T12:00:00Z",
						modified: "2024-07-27T12:00:00Z",
						dataset_ids: [],
						folder_ids: ["66a80284cf77abbb78b4435f"],
						file_ids: [],
						creator: {
							id: "669ea726d559628438e57841",
							first_name: "Chen",
							last_name: "Wang",
							email: "cwang138@illinois.edu",
						},
					},
				],
			},
			receivedAt: Date.now(),
		});
	};
}

export const RECEIVE_PROJECT = "RECEIVE_PROJECT";

export function fetchProject(id) {
	return (dispatch) => {
		dispatch({
			type: RECEIVE_PROJECT,
			project: {
				id: id,
				name: "Sample Project",
				description: "A description of the sample project",
				created: "2024-07-29T12:00:00Z",
				modified: "2024-07-29T12:00:00Z",
				dataset_ids: ["669ea731d559628438e5785d", "669ea746d559628438e5788f"],
				folder_ids: ["66a085640c20e43f5c50b059"],
				file_ids: ["669fcf4c78f3222201e18a0f"],
				creator: {
					id: "60f9f8c8c23f5c45d8f0e0c6",
					first_name: "Chen",
					last_name: "Wang",
					email: "cwang138@illinois.edu",
				},
			},
			receivedAt: Date.now(),
		});
	};
}
