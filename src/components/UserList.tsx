// UserList Component
// Contains the following:
// - Receives list of users from useSearch hook
// - Displays list of users with avatar and handle

import Link from "next/link";
import Image from "next/image";
import { AppBskyActorDefs } from "@atproto/api";

interface UserListProps {
  users: AppBskyActorDefs.ProfileViewBasic[];
}

function UserAvatar({ user }: { user: AppBskyActorDefs.ProfileViewBasic }) {
  const initial = user.displayName?.charAt(0) ?? user.handle.charAt(0);
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt=""
        width={48}
        height={48}
        className="w-12 h-12 rounded-full object-cover border border-zinc-700"
        unoptimized
      />
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xl font-bold text-zinc-400">
      {initial}
    </div>
  );
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return <p className="text-zinc-500 text-sm">No users found.</p>;
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {users.map((user, idx) => (
        <li
          key={idx}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center transition-all hover:opacity-80 relative"
        >
          <Link
            href={`/profile/${user.handle}`}
            className="absolute inset-0 rounded-xl z-10"
            aria-label={`View ${user.handle}'s profile`}
          />
          <div className="flex items-center gap-4 z-0 relative pointer-events-none w-full min-w-0">
            <UserAvatar user={user} />
            <div className="flex flex-col overflow-hidden min-w-0 flex-1">
              <span className="font-medium text-zinc-100 truncate block">
                {user.displayName || user.handle}
              </span>
              <span className="text-sm text-zinc-400 truncate block">
                @{user.handle}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
