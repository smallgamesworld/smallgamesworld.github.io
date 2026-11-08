// The invite page. The token is after # in the link, so the server hosting this page never sees
// it. The page hands it to the app and keeps no record of it.

// Must match _token in app/lib/core/deep_links.dart. A test checks they stay the same.
const tokenPattern = /^[A-Za-z0-9_-]{20,}$/;

/** The token in the page's #, or null if there isn't a valid one. */
export function tokenFrom(hash) {
  const token = hash.startsWith("#") ? hash.slice(1) : "";
  return tokenPattern.test(token) ? token : null;
}

/** The link that opens the app on this invite. */
export function appLink(token) {
  return `privatecircle://open/i/${token}`;
}

function show(id) {
  document.getElementById(id).hidden = false;
}

function setUp() {
  const token = tokenFrom(location.hash);
  if (!token) {
    show("broken");
    return;
  }

  show("invite");
  document.getElementById("open").href = appLink(token);

  const copy = document.getElementById("copy");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      copy.textContent = "Copied. Paste it in the app.";
    } catch {
      copy.textContent = "Couldn't copy. Copy the address from the address bar instead.";
    }
  });
}

if (typeof document !== "undefined") setUp();
