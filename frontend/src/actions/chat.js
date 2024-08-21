import { V2 } from "../openapi";
import { handleErrors } from "./common";
import { RECEIVE_METADATA_DEFINITIONS } from "./metadata";

export const SEND_CHAT_PROMPT = "SEND_CHAT_PROMPT";
export function sendChatPromptSent(prompt) {
	return (dispatch) => {
		return V2.LlmService.llmApiV2LlmPost(prompt)
			.then((json) => {
				dispatch({
					type: SEND_CHAT_PROMPT,
					promptResponse: json,
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, sendChatPromptSent(prompt)));
			});
	};
}
