export function LoginButton() {
  return (
    <button
      onClick={() => { window.location.href = "/api/auth/slack"; }}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Sign in with Slack
    </button>
  );
}
