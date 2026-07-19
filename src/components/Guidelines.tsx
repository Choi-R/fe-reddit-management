
export default function Guidelines() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Introduction Card */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Reddit Promotion Handbook
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
          Welcome to the Reddit Account Management portal. Please study these guidelines carefully. Adhering to these rules is vital to protect our accounts from bans and ensure eligibility for task payouts.
        </p>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        
        {/* Section 1: Task Eligibility Requirements */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
          <h4 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            1. Payout Eligibility Requirements
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Your task submissions are eligible for payment if they fulfill the following conditions:
          </p>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>High Visibility:</strong> Your reply must appear without scrolling down too much. You can start a new comment (if the post has no comment) or reply directly to the top comment to achieve this.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Longevity:</strong> Your reply must stay alive at least until the payment date (typically safe if it lasts at least 7 days). Folded, deleted, or shadowbanned replies are not eligible.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Vote Ratio:</strong> While a negative vote is okay, excessive downvotes will result in the comment being folded, which voids eligibility.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Fulfill Client Request:</strong> Ensure you insert the client's URL under the specified brand recommendation column or context.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Thread Status:</strong> The target Reddit post must remain active and must not be deleted.
            </li>
          </ul>
        </div>

        {/* Section 2: Payment Schema */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-success)' }}>
          <h4 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            2. Payment Schema & Cycle
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Payments are accumulated and paid out periodically based on the cycle below:
          </p>
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
              💰 <strong style={{ color: 'var(--color-success)' }}>Payout Timeframe:</strong> First week of the following month.
            </p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              📅 <strong style={{ color: 'var(--color-warning)' }}>Monthly Cut-off Date:</strong> 24th of each month.
            </p>
          </div>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--color-warning)' }}>
            <strong>Cycle Warning:</strong> Submissions created on or after the 25th of the month will be included in the cycle of the following month (resulting in a 2-month cycle).
          </div>
        </div>

        {/* Section 3: Safety Warnings */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-danger)' }}>
          <h4 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            3. Account Safety & Warnings
          </h4>
          <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Maintain Account Health:</strong> Keep your Reddit account active and natural. Increase your karma and non-promotional activity organically to prevent your account from looking like a bot/ad account.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Pacing tasks:</strong> Avoid doing too many tasks in a short timeframe. Spread them out (e.g. 1 task every 1 or 2 days).
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Subreddit Rules:</strong> You must read each subreddit's rules before participating. Make promotions extremely natural in link-restricted communities.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Reporting Issues:</strong> If a target post is deleted or archived, report it in the task's spreadsheet row instead of submitting.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Declining Tasks:</strong> If a task feels too risky, has strict subreddit rules, or you wish to skip it, flag/report it in the task's row.
            </li>
          </ul>
        </div>

        {/* Section 4: Beginner's Guide */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-warning)' }}>
          <h4 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            4. Beginner's Guide & Tips
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
            Maximize success using the recommended <strong style={{ color: 'var(--text-primary)' }}>2-Step Commenting Strategy</strong>:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>
              <span style={{ display: 'inline-block', backgroundColor: 'var(--border-color)', color: 'var(--text-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginRight: '0.5rem', fontWeight: 'bold' }}>Step 1</span>
              Post a helpful, high-quality "vanilla" response without any link. Let it rest for 24 to 48 hours.
            </div>
            <div>
              <span style={{ display: 'inline-block', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: 'var(--color-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', marginRight: '0.5rem', fontWeight: 'bold' }}>Step 2</span>
              Edit your comment to naturally insert the client's link or recommendation.
            </div>
          </div>
          <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            🤖 <strong>AI Usage:</strong> You may use AI to draft responses, but ensure the output matches your personal writing style, incorporates local post context, and does not seem automated.
          </div>
        </div>

      </div>
    </div>
  );
}
