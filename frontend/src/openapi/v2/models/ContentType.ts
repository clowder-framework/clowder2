/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * This model describes the content type of any type of file(File or Visualization data) uploaded to Clowder. A typical example is "text/plain" for .txt.
 * In Clowder v1 extractors, "text/*" syntax is acceptable for wildcard matches. To support this, the content type is
 * split into main ("text") and secondary ("plain") parts so the dynamic matching with * can still be done.
 */
export type ContentType = {
	content_type?: string;
	main_type?: string;
};
