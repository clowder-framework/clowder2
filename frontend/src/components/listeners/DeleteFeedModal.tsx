import React from "react";

import { ActionModal } from "../dialog/ActionModal";
import { deleteFeed as deleteFeedAction } from "../../actions/listeners";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

type DeleteFeedModal = {
	deleteFeedConfirmOpen: any;
	setDeleteFeedConfirmOpen: any;
	feedId: string | undefined;
};

export default function DeleteFeedModal(props: DeleteFeedModal) {
	const { deleteFeedConfirmOpen, setDeleteFeedConfirmOpen, feedId } = props;
	const history = useNavigate();
	const dispatch = useDispatch();
	const deleteFeed = (FeedId: string | undefined) =>
		dispatch(deleteFeedAction(FeedId));
	return (
		<ActionModal
			actionOpen={deleteFeedConfirmOpen}
			actionTitle="Are you sure?"
			actionText="Do you really want to delete this feed? This process cannot be undone."
			actionBtnName="Delete"
			handleActionBtnClick={() => {
				deleteFeed(feedId);
				setDeleteFeedConfirmOpen(false);
				history("/feeds");
			}}
			handleActionCancel={() => {
				setDeleteFeedConfirmOpen(false);
			}}
		/>
	);
}
