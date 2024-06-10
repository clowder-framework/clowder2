import { V2 } from "../openapi";

// TODO this need to go away in v2; same function already in redux
// TODO this exist because on dataset page we need to call multiple files id to collect their thumbnail
// TODO fixme when thumbnail is available in V2
// TODO moving it into redux cuz i need to dispatch the error message
export async function fetchFileMetadata(id) {
	return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id)
		.then((fileSummary) => {
			return fileSummary;
		})
		.catch((reason) => {
			if (reason.status === 401) {
				console.error(
					"Failed to get file summary: Not authenticated: ",
					reason,
				);
				// logout();
				return {};
			} else {
				console.error("Failed to get file summary: ", reason);
				return {};
			}
		});
}
