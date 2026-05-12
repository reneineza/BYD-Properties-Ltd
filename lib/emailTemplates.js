/**
 * BYD Properties — Shared Email Templates
 *
 * Brand tokens (from globals.css):
 *   Navy  : #1c2d37
 *   Gold  : #df9f3d
 *   Cream : #f4f1ec
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bydproperties.rw';

// ─── Primitive colours ────────────────────────────────────────────────────
const C = {
  navy:        '#1c2d37',
  navyLight:   '#253645',
  navyDark:    '#141f28',
  gold:        '#df9f3d',
  goldLight:   '#f0b84a',
  goldDim:     'rgba(223,159,61,0.15)',
  goldBorder:  'rgba(223,159,61,0.25)',
  cream:       '#f4f1ec',
  white:       '#ffffff',
  textMuted:   '#94a3b8',   // slate-400
  textBody:    '#cbd5e1',   // slate-300
  textSub:     '#64748b',   // slate-500
};

// ─── Shared wrapper / chrome ──────────────────────────────────────────────
function wrapEmail({ title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .main-wrapper { padding: 32px 12px !important; }
      .card-body { padding: 32px 24px !important; }
      .heading { font-size: 24px !important; line-height: 1.3 !important; }
      .body-text { font-size: 14px !important; line-height: 1.6 !important; }
      .btn { padding: 14px 24px !important; font-size: 13px !important; display: block !important; text-align: center !important; width: auto !important; box-sizing: border-box !important; }
      .btn-container { width: 100% !important; }
      .mobile-stack { display: block !important; width: 100% !important; padding-bottom: 2px !important; }
      .info-box { padding: 16px !important; }
      .feature-pill { width: 100% !important; display: block !important; margin-bottom: 8px !important; padding: 0 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.navyDark};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" class="main-wrapper"
         style="background:${C.navyDark};padding:48px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;">

        <!-- ── Logo ────────────────────────────────── -->
        <tr>
          <td align="center" style="padding-bottom:36px;">
            <a href="${SITE_URL}" style="display:inline-block;">
              <img src="${SITE_URL}/logo-transparent.png"
                   alt="BYD Properties"
                   width="140"
                   style="display:block;height:auto;" />
            </a>
          </td>
        </tr>

        <!-- ── Card ────────────────────────────────── -->
        <tr>
          <td style="border-radius:20px;overflow:hidden;
                     border:1px solid ${C.goldBorder};
                     background:linear-gradient(160deg,${C.navyLight} 0%,${C.navy} 100%);">

            <!-- Gold top stripe -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="height:5px;
                           background:linear-gradient(90deg,${C.gold},${C.goldLight},${C.gold});">
                </td>
              </tr>
            </table>

            <!-- Card body -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td class="card-body" style="padding:48px;">
                ${bodyHtml}
              </td></tr>
            </table>

            <!-- Gold bottom stripe -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="height:2px;background:${C.goldBorder};"></td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Footer ───────────────────────────────── -->
        <tr>
          <td style="padding:36px 0 0;text-align:center;">
            <!-- Social / website -->
            <p style="margin:0 0 10px;font-size:13px;color:${C.textSub};">
              <a href="${SITE_URL}" style="color:${C.gold};text-decoration:none;font-weight:600;">
                www.bydproperties.rw
              </a>
            </p>
            <p style="margin:0 0 6px;font-size:12px;color:${C.textSub};">
              BYD Properties Ltd &middot; Kigali, Rwanda
            </p>
            <p style="margin:0;font-size:12px;color:${C.textSub};">
              Questions?
              <a href="mailto:info@bydproperties.rw"
                 style="color:${C.textMuted};text-decoration:underline;">
                info@bydproperties.rw
              </a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
}

// ─── Reusable snippets ────────────────────────────────────────────────────
const divider = `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr><td style="height:1px;background:${C.goldBorder};"></td></tr>
  </table>`;

function eyebrow(text) {
  return `<p style="margin:0 0 10px;font-size:11px;font-weight:700;
                  letter-spacing:0.2em;text-transform:uppercase;
                  color:${C.gold};">${text}</p>`;
}

function heading(text) {
  return `<h1 class="heading" style="margin:0 0 20px;font-size:28px;font-weight:700;
                   color:${C.white};line-height:1.25;">${text}</h1>`;
}

function body(text) {
  return `<p class="body-text" style="margin:0 0 16px;font-size:15px;color:${C.textBody};
                 line-height:1.8;">${text}</p>`;
}

function cta(href, label) {
  return `
  <table cellpadding="0" cellspacing="0" border="0" class="btn-container" style="margin-top:36px;">
    <tr><td style="border-radius:50px;
                   background:linear-gradient(135deg,${C.gold},${C.goldLight});">
      <a href="${href}"
         class="btn"
         style="display:inline-block;padding:16px 44px;
                color:${C.navy};text-decoration:none;
                font-weight:700;font-size:14px;
                letter-spacing:0.06em;text-transform:uppercase;">
        ${label} &rarr;
      </a>
    </td></tr>
  </table>`;
}

function infoBox(rowsHtml) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin:24px 0;border-radius:12px;
                background:${C.goldDim};
                border:1px solid ${C.goldBorder};">
    <tr><td class="info-box" style="padding:20px 24px;">
      ${rowsHtml}
    </td></tr>
  </table>`;
}

function infoRow(label, value) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;">
    <tr>
      <td width="38%" class="mobile-stack" style="font-size:12px;color:${C.textSub};padding:3px 0;">${label}</td>
      <td class="mobile-stack" style="font-size:13px;font-weight:600;color:${C.white};padding:3px 0;">${value}</td>
    </tr>
  </table>`;
}

function badge(label, color = C.gold) {
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
    <tr>
      <td style="border-radius:20px;
                 background:rgba(223,159,61,0.1);
                 border:1px solid rgba(223,159,61,0.3);
                 padding:5px 16px;">
        <p style="margin:0;font-size:11px;font-weight:700;
                  letter-spacing:0.12em;text-transform:uppercase;
                  color:${color};">&#9679; ${label}</p>
      </td>
    </tr>
  </table>`;
}

function stepList(steps) {
  return steps.map((step, i) => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
         style="margin-bottom:12px;">
    <tr>
      <td width="30" valign="top" style="padding-top:1px;">
        <div style="width:24px;height:24px;border-radius:50%;
                    background:${C.gold};text-align:center;line-height:24px;
                    font-size:11px;font-weight:700;color:${C.navy};">
          ${i + 1}
        </div>
      </td>
      <td style="padding-left:12px;font-size:14px;
                 color:${C.textBody};line-height:1.7;">
        ${step}
      </td>
    </tr>
  </table>`).join('');
}

function sectionLabel(text) {
  return `<p style="margin:28px 0 12px;font-size:11px;font-weight:700;
                  letter-spacing:0.2em;text-transform:uppercase;
                  color:${C.gold};">${text}</p>`;
}

// ─── Template: Welcome (newsletter subscription) ──────────────────────────
export function welcomeEmailHtml({ email, unsubscribeUrl }) {
  const bodyHtml = `
    ${eyebrow('Welcome to the Family')}
    ${heading("You&rsquo;re in! &nbsp;&#127968;")}
    ${divider}
    ${body(`Thank you for subscribing to <strong style="color:${C.white};">BYD Properties</strong>. You&rsquo;ll now be the <strong style="color:${C.gold};">first to know</strong> about our newest exclusive listings across Rwanda.`)}
    ${body(`From luxury apartments in Kigali to prime commercial spaces and land plots, we curate only the finest properties for discerning buyers and investors.`)}

    <!-- Feature pills -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
      <tr>
        ${['&#127970; Exclusive Listings', '&#128276; First to Know', '&#128205; Prime Locations'].map(pill => `
        <td width="33%" class="feature-pill" style="padding:0 5px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="background:${C.goldDim};border:1px solid ${C.goldBorder};
                            border-radius:10px;padding:14px 10px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:700;
                        letter-spacing:0.06em;text-transform:uppercase;
                        color:${C.gold};">${pill}</p>
            </td></tr>
          </table>
        </td>`).join('')}
      </tr>
    </table>

    ${cta(`${SITE_URL}/properties`, 'Browse Properties')}

    <p style="margin:40px 0 0;font-size:12px;color:${C.textSub};line-height:1.7;">
      You received this because you subscribed at bydproperties.rw.&nbsp;
      <a href="${unsubscribeUrl}" style="color:${C.textMuted};text-decoration:underline;">Unsubscribe</a>
    </p>
  `;
  return wrapEmail({ title: 'Welcome to BYD Properties', bodyHtml });
}

// ─── Template: Agent application received ────────────────────────────────
export function agentReceivedEmailHtml({ firstName, name, email: agentEmail, specialization, city }) {
  const bodyHtml = `
    ${eyebrow('Application Received')}
    ${heading(`Thank you, ${firstName}!`)}
    ${divider}
    ${body(`We have received your application to join the <strong style="color:${C.white};">BYD Properties</strong> agent network and it is now <strong style="color:${C.gold};">under review</strong> by our team.`)}
    ${body(`Our team carefully evaluates every application to maintain the highest standards of professionalism. We will contact you within <strong style="color:${C.white};">2–3 business days</strong>.`)}

    ${infoBox(`
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;
                letter-spacing:0.15em;text-transform:uppercase;
                color:${C.gold};">Your Application Summary</p>
      ${infoRow('Full Name', name)}
      ${infoRow('Email', agentEmail)}
      ${specialization ? infoRow('Specialization', specialization) : ''}
      ${city ? infoRow('Location', city) : ''}
      ${badge('Under Review')}
    `)}

    ${sectionLabel('What Happens Next')}
    ${stepList([
      'Our team reviews your application and verifies your details.',
      'You receive an approval (or update) email within 2–3 business days.',
      'Once approved, you gain access to your agent portal to list and manage properties.',
    ])}

    ${cta(`${SITE_URL}/properties`, 'Browse Our Properties')}
  `;
  return wrapEmail({ title: 'Application Received — BYD Properties', bodyHtml });
}

// ─── Template: Agent approved ─────────────────────────────────────────────
export function agentApprovedEmailHtml({ firstName, name, email: agentEmail }) {
  const bodyHtml = `
    ${eyebrow('Application Approved')}
    ${heading(`Welcome to the team, ${firstName}! &#127881;`)}
    ${divider}
    ${body(`We are delighted to inform you that your application to join the <strong style="color:${C.white};">BYD Properties</strong> agent network has been <strong style="color:${C.gold};">approved</strong>.`)}
    ${body(`You can now access your agent portal to manage listings, track inquiries, and grow your real estate business with Rwanda&rsquo;s leading property platform.`)}

    ${infoBox(`
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;
                letter-spacing:0.15em;text-transform:uppercase;
                color:${C.gold};">Your Login Details</p>
      ${infoRow('Name', name)}
      ${infoRow('Email', agentEmail)}
      ${infoRow('Password', 'The password you set during registration')}
      ${badge('Approved ✓')}
    `)}

    ${sectionLabel('Get Started in 3 Steps')}
    ${stepList([
      `Log in to your agent portal at <a href="${SITE_URL}/agent" style="color:${C.gold};">bydproperties.rw/agent</a> using your email and password.`,
      'Complete your profile — add a professional photo and bio so clients can trust you.',
      'Start listing properties, responding to inquiries, and closing deals.',
    ])}

    ${cta(`${SITE_URL}/agent`, 'Access Agent Portal')}
  `;
  return wrapEmail({ title: 'Application Approved — BYD Properties', bodyHtml });
}

// ─── Template: Agent rejected ─────────────────────────────────────────────
export function agentRejectedEmailHtml({ firstName, name }) {
  const bodyHtml = `
    ${eyebrow('Application Update')}
    ${heading(`Thank you for applying, ${firstName}.`)}
    ${divider}
    ${body(`Dear ${name}, after careful review of your application, we are unfortunately unable to approve your request to join the <strong style="color:${C.white};">BYD Properties</strong> agent network at this time.`)}
    ${body(`This decision may be due to current capacity, regional coverage requirements, or specific experience criteria. We encourage you to reapply as our network continues to grow across Rwanda.`)}
    ${body(`We sincerely appreciate the time you took to apply and wish you the very best in your real estate career.`)}

    ${infoBox(`
      <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:${C.white};">
        Still interested in our properties?
      </p>
      <p style="margin:0;font-size:13px;color:${C.textBody};line-height:1.7;">
        You can browse and inquire about our exclusive listings across Rwanda as a buyer or investor.
      </p>
    `)}

    ${cta(`${SITE_URL}/properties`, 'Browse Properties')}
  `;
  return wrapEmail({ title: 'Application Update — BYD Properties', bodyHtml });
}

// ─── Template: New property alert (to subscribers) ────────────────────────
export function propertyAlertEmailHtml({ title: propTitle, location, price, currency, propertyUrl, imageUrl }) {
  const formattedPrice = price
    ? `${currency || 'RWF'} ${Number(price).toLocaleString()}`
    : 'Price on request';

  const bodyHtml = `
    ${eyebrow('New Listing')}
    ${heading('A New Property Just Went Live!')}
    ${divider}
    ${body(`A property has just been approved and is now live on <strong style="color:${C.white};">BYD Properties</strong>. Be among the first to discover this exclusive listing.`)}

    <!-- Property card -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="margin:24px 0;border-radius:14px;overflow:hidden;
                  border:1px solid ${C.goldBorder};">
      ${imageUrl ? `
      <tr>
        <td style="height:220px;overflow:hidden;background:${C.navy};">
          <img src="${imageUrl}" alt="${propTitle}"
               width="100%"
               style="display:block;width:100%;height:220px;object-fit:cover;opacity:0.92;" />
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding:24px 28px;background:${C.goldDim};">
          <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:${C.white};">
            ${propTitle}
          </p>
          <p style="margin:0 0 12px;font-size:13px;color:${C.textMuted};">
            &#128205; ${location}
          </p>
          <p style="margin:0;font-size:22px;font-weight:700;color:${C.gold};">
            ${formattedPrice}
          </p>
        </td>
      </tr>
    </table>

    ${cta(propertyUrl, 'View Property Details')}

    <p style="margin:36px 0 0;font-size:12px;color:${C.textSub};line-height:1.7;">
      You received this because you subscribed to BYD Properties alerts.
    </p>
  `;
  return wrapEmail({ title: `New Listing: ${propTitle} — BYD Properties`, bodyHtml });
}

// ─── Template: Agent property approved ─────────────────────────────────────
export function agentPropertyApprovedEmailHtml({ firstName, title, propertyUrl }) {
  const bodyHtml = `
    ${eyebrow('Property Approved')}
    ${heading('Your Listing is Live! &#127881;')}
    ${divider}
    ${body(`Good news, ${firstName}! Your property listing for <strong style="color:${C.white};">${title}</strong> has been reviewed and <strong style="color:${C.gold};">approved</strong> by our team.`)}
    ${body(`It is now publicly visible on the BYD Properties website and can be viewed by potential buyers and investors.`)}

    ${cta(propertyUrl, 'View Live Property')}
  `;
  return wrapEmail({ title: 'Property Approved — BYD Properties', bodyHtml });
}

// ─── Template: Agent property rejected ─────────────────────────────────────
export function agentPropertyRejectedEmailHtml({ firstName, title, agentPortalUrl }) {
  const bodyHtml = `
    ${eyebrow('Property Update')}
    ${heading('Action Required for Your Listing')}
    ${divider}
    ${body(`Hi ${firstName}, your recent property submission for <strong style="color:${C.white};">${title}</strong> requires some adjustments before it can be published.`)}
    ${body(`Our administrative team has flagged the listing for review. Please log in to your agent portal to check your pending properties, update any missing or incorrect details, and resubmit for approval.`)}

    ${cta(agentPortalUrl, 'Go to Agent Portal')}
  `;
  return wrapEmail({ title: 'Action Required: Property Listing — BYD Properties', bodyHtml });
}
