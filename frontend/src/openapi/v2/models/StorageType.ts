/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Depending on the StorageType,the file may need different properties such as local path or URL.
 * Also, some StorageTypes do not support versioning or anonymous sharing.
 */
export enum StorageType {
	MINIO = "minio",
	LOCAL = "local",
	REMOTE = "remote",
	AWS = "aws",
}
