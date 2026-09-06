const EMAIL_KEY = "apx2_notify_email";
const NOTIFIED_KEY = "apx2_notified_chapters";

export function getNotifyEmail() {
  try {
    return window.localStorage.getItem(EMAIL_KEY) || "";
  } catch (_) {
    return "";
  }
}

export function setNotifyEmail(email) {
  try {
    window.localStorage.setItem(EMAIL_KEY, email);
  } catch (_) {}
}

export function getNotifiedChapters() {
  try {
    const raw = window.localStorage.getItem(NOTIFIED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function markChapterNotified(chapterId) {
  try {
    const list = getNotifiedChapters();
    if (!list.includes(chapterId)) {
      list.push(chapterId);
      window.localStorage.setItem(NOTIFIED_KEY, JSON.stringify(list));
    }
  } catch (_) {}
}

export async function sendChapterCompleteEmail({ email, subject, chapterId, chapterName }) {
  const res = await fetch("/api/send-chapter-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, subject, chapterId, chapterName })
  });
  if (!res.ok) {
    let details = "";
    try {
      details = JSON.stringify(await res.json());
    } catch (_) {}
    throw new Error("Email request failed (" + res.status + "): " + details);
  }
  return res.json();
}