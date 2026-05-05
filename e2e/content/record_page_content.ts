export const recordPageContent = {
  title: "Record - ATtune",
  heading: "Add a Review",
  description: "Search Album",
  searchPlaceholder: "Type an album or artist name...",
  startTypingMessage: "Start typing to search for an album to review",
  yourReviewsHeading: "Your Reviews",
  reviewFunctionsSubheading:
    "Edit, delete a review or click on a review to view comments",
  albumName: (album: string) => `${album}`,
  artistName: (artist: string) => `${artist}`,
  ratingHeading: "Rating (0/5)",
  reviewHeading: "Review",
  rating: "5",
  reviewTextPlaceholder: "What did you think?",
  dateListenedHeading: "Date Listened",
  publishToBluesky: "Publish to Bluesky Timeline",
  publishToBlueskyDescription:
    "If unchecked, this review will only be saved to your ATtune profile. Comments will be disabled.",
  postReviewButton: "Post Review",
  cancelButton: "Cancel",
  commentsText: "Comments (",
  firstReviewLocator:
    "body > div.min-h-screen.font-sans.selection\\:bg-sky-500\\/30 > main > div:nth-child(3) > div > div:nth-child(2)",
  commentFormLocator: "#comment-input",
  addCommentLabel: "Add a comment",
  postCommentButton: "Post Comment",
  closeCommentModal: "Close modal",
};
