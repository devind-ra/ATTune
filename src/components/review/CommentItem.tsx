// CommentItem component
// Contains the following:
// - Displaying a single comment with avatar, display name, handle, and text

import Image from "next/image";
import { AppBskyFeedDefs, AppBskyFeedPost } from "@atproto/api";

export function CommentItem({
    comment,
}: {
    comment: AppBskyFeedDefs.ThreadViewPost;
}) {
    const { post } = comment;
    const record = post.record as AppBskyFeedPost.Record;
    return (
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                {post.author.avatar && (
                    <Image
                        src={post.author.avatar}
                        width={24}
                        height={24}
                        alt="avatar"
                        className="w-6 h-6 rounded-full"
                    />
                )}
                <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                    {post.author.displayName || post.author.handle}
                </span>
                <span className="text-xs text-zinc-500">@{post.author.handle}</span>
            </div>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {record.text}
            </p>
        </div>
    );
}
