import { DataAction } from "../types/action";
import { SEND_CHAT_PROMPT } from "../actions/chat";
import { ChatMessage } from "../types/data";
import { PromptResponse } from "../openapi/v2";

const defaultState: ChatMessage = {
	promptResponse: <PromptResponse>{},
};
const llm = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case SEND_CHAT_PROMPT:
			return Object.assign({}, state, {
				promptResponse: action.promptResponse,
			});
		default:
			return state;
	}
};

export default llm;
