/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * holds all information about a file
 */
export type binary = {
	id?: string;
	filename?: string;
	/**
	 * only specified if user is serveradmin, and storage is
	 * DiskByteStorageService
	 *
	 */
	filepath?: string;
	/**
	 * only specified if user is serveradmin, and storage is
	 * S3ByteStorageService
	 *
	 */
	"service-endpoint"?: string;
	/**
	 * only specified if user is serveradmin, and storage is
	 * S3ByteStorageService
	 *
	 */
	"bucket-name"?: string;
	/**
	 * only specified if user is serveradmin, and storage is
	 * S3ByteStorageService
	 *
	 */
	"object-key"?: string;
	filedescription?: string;
	"content-type"?: string;
	"date-created"?: string;
	size?: string;
	/**
	 * id of user who uploaded the file
	 */
	authorId?: string;
	/**
	 * optinal id of the thumbnail image of this file
	 *
	 */
	thumbnail?: string;
	/**
	 * status of the file, this can be one of the following:
	 * - CREATED file is created, but blob is not in final place yes
	 * - PROCESSING blob is in final place, final processing is done such as sending messagess to RabbitMQ
	 * - PROCESSED file is fully procesed by clowder
	 *
	 */
	status?: string;
};
