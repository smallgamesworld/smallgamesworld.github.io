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

/** Where each phone gets the app. Empty until there is somewhere, and then only Copy is offered. */
export const stores = {
  android: "https://play.google.com/apps/internaltest/4699353918281410718",
  ios: "",
};

/** The kind of phone, from the browser's own description of itself. */
export function platformOf(userAgent) {
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  return "other";
}

/** Copies the invite, then goes to the store. False, going nowhere, if it can't be copied. */
export async function getApp(copyText, go, link, storeUrl) {
  try {
    await copyText(link);
  } catch {
    return false;
  }
  go(storeUrl);
  return true;
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

  const platform = platformOf(navigator.userAgent);
  const store = stores[platform] ?? "";
  const main = document.getElementById("main");
  const note = document.getElementById("note");
  const copyText = (text) => navigator.clipboard.writeText(text);

  if (store) {
    main.textContent = "Get Diary of Ten";
    note.textContent = "We'll copy your invite, so the app can pick it up.";
    document.getElementById("store").href = store;
    main.addEventListener("click", async () => {
      const went = await getApp(copyText, (url) => location.assign(url), location.href, store);
      if (went) return;
      main.hidden = true;
      note.textContent =
        "We couldn't copy your invite. Get the app, then come back and tap “Open the app” below.";
      document.getElementById("store").hidden = false;
    });
  } else {
    main.textContent = "Copy the invite";
    note.textContent = platform === "other"
      ? "Open this link on your phone, or copy it there."
      : "Then ask the person who invited you how to get the app.";
    main.addEventListener("click", async () => {
      try {
        await copyText(location.href);
        main.textContent = "Copied";
      } catch {
        note.textContent = "We couldn't copy it. Copy the address from the address bar instead.";
      }
    });
  }
  if (platform === "other") document.getElementById("have").hidden = true;
}

if (typeof document !== "undefined") setUp();
