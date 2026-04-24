// AuthModals component
// Contains the following:
// - Help modal
// - Signup modal

import Link from "next/link";

type ModalType = "help" | "signup" | null;

interface Props {
  activeModal: ModalType;
  onClose: () => void;
}

function HelpModalContent() {
  return (
    <>
      <h3 className="text-xl font-bold mb-4 text-white">
        How to get an App Password
      </h3>
      <div className="prose prose-sm space-y-3 text-zinc-300">
        <p>
          To keep your account secure, you should use an App Password instead of
          your main password.
        </p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            Go to{" "}
            <Link
              href="https://bsky.app/settings"
              target="_blank"
              className="text-sky-600 hover:underline"
            >
              Settings
            </Link>{" "}
            in Bluesky.
          </li>
          <li>
            Scroll down to <strong>Privacy and Security</strong>.
          </li>
          <li>
            Click on <strong>App passwords</strong>.
          </li>
          <li>
            Click <strong>Add App Password</strong>.
          </li>
          <li>
            Enter &quot;ATtune&quot; as the name and copy the code (and save it
            somewhere safe!).
          </li>
        </ol>
      </div>
    </>
  );
}

function SignupModalContent() {
  return (
    <>
      <h3 className="text-xl font-bold mb-4 text-white">Join Bluesky</h3>
      <p className="mb-6 text-zinc-300">
        ATtune is built on the AT Protocol. To use ATtune, you need a Bluesky
        account.
      </p>
      <ol className="list-decimal pl-5 space-y-1 mb-6">
        <li>Click on the button below to sign up for a Bluesky account.</li>
        <li>
          After creating your account, come back here to sign in with your app
          password!
        </li>
      </ol>
      <Link
        href="https://bsky.app/settings/app-passwords"
        target="_blank"
        className="block w-full text-center py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors"
      >
        Go to bsky.app to Sign Up
      </Link>
    </>
  );
}

export function AuthModals({ activeModal, onClose }: Props) {
  if (!activeModal) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {activeModal === "help" ? <HelpModalContent /> : <SignupModalContent />}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
