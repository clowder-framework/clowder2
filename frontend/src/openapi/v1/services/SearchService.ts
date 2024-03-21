/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class SearchService {
	/**
	 * Perform a basic search
	 * Return files, datasets and/or collections matching query criteria. Search
	 * can be filtered by a specific resource ID, limited to tags or specific
	 * metadata fields.
	 *
	 * @param query String term to search for. Can include regular expressions using Elasticsearch syntax.
	 * @param resourceType Restrict search results to "file", "dataset", or "collection".
	 * @param datasetid Return only resources belonging to a specific dataset.
	 * @param collectionid Return only resources belonging to a specific collection.
	 * @param spaceid Return only resources belonging to a specific space.
	 * @param folderid Return only resources belonging to a specific folder.
	 * @param field Restrict search to a specific metadata field, e.g. "Alternative Title".
	 * @param tag Search for resources with a specific tag.
	 * @param from Starting index of first result; useful for pagination.
	 * @param size Number of search results to include; useful for pagination.
	 * @param page An alternative to "from" for pagination. Return the Nth page assuming "size" items per page.
	 * @param sort A date or numeric field to sort by. If order is given but no field specified, created date is used.
	 * @param order Whether to scored in asc (ascending) or desc (descending) order. If a field is given without an order, asc is used.
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getSearch(
		query?: string,
		resourceType?: string,
		datasetid?: string,
		collectionid?: string,
		spaceid?: string,
		folderid?: string,
		field?: string,
		tag?: string,
		from?: number,
		size?: number,
		page?: number,
		sort?: string,
		order: "asc" | "desc" = "asc"
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/search`,
			query: {
				query: query,
				resource_type: resourceType,
				datasetid: datasetid,
				collectionid: collectionid,
				spaceid: spaceid,
				folderid: folderid,
				field: field,
				tag: tag,
				from: from,
				size: size,
				page: page,
				sort: sort,
				order: order,
			},
		});
	}
}
