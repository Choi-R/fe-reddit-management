// ─── EDIT YOUR CONTACT INFORMATION HERE ──────────────────────────────
const TELEGRAM_HANDLE = 'Choi';
const TELEGRAM_URL = 'https://t.me/Choirul_R';
const TELEGRAM_GROUP_URL = 'https://t.me/+cvtVOk8THhk3YThl';
const CONTACT_EMAIL = 'choirulfreelance@gmail.com';
// ─────────────────────────────────────────────────────────────────────

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container glass-panel">
      <div className="footer-content">
        <div className="footer-copyright">
          <span>&copy; {currentYear} Reddit CRM. All rights reserved.</span>
        </div>

        <div className="footer-contacts">
          <span className="footer-label">Contact:</span>

          {TELEGRAM_URL && (
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
              title="Contact on Telegram"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="footer-icon"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              <span>Telegram: {TELEGRAM_HANDLE}</span>
            </a>
          )}

          {TELEGRAM_GROUP_URL && (
            <a
              href={TELEGRAM_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-item"
              title="Join Telegram Group"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="footer-icon"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Telegram Group</span>
            </a>
          )}

          {CONTACT_EMAIL && (
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="footer-contact-item"
              title="Send an Email"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="footer-icon"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>{CONTACT_EMAIL}</span>
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
