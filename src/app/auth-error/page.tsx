export default function AuthErrorPage() {
  return (
    <div className="max-w-xl mx-auto py-32 px-8 text-center">
      <div className="text-xl">Oops! Something went wrong.</div>
      <div className="mt-4 text-md text-gray-300">
        It looks like your cookies might be stale. Try clearing your cookies just for catalog.fyi,
        and then going{" "}
        <a className="cat-link" href="/" target="_blank">
          home
        </a>{" "}
        in a new tab. (You can look up instructions for how to clear cookies for a specific site
        with the device/browser you're using, so that you don't have to clear ALL your cookies and
        get logged out of everything you use.)
        <div className="mt-4">
          You can get in touch by{" "}
          <a href="mailto:staff@catalog.fyi" className="cat-link">
            email
          </a>{" "}
          or{" "}
          <a href="https://discord.gg/BWTSEkDT9W" className="cat-link">
            Discord
          </a>{" "}
          if you need help from our team.
        </div>
      </div>
    </div>
  )
}
