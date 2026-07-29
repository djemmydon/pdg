const BRAND_ORANGE = "#F97316";
const BRAND_ORANGE_DARK = "#C2410C";

// Plain inline-styled HTML, no CSS classes and no SVG, since email clients
// strip both unpredictably. The wordmark is rendered as styled text instead
// of reusing the Logo.tsx component.
export function emailLayout(bodyHtml: string): string {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg, ${BRAND_ORANGE}, ${BRAND_ORANGE_DARK});padding:24px 32px;">
                <span style="font-size:22px;font-weight:800;letter-spacing:1px;color:#ffffff;">PDG</span>
                <span style="font-size:13px;color:#FFEDD5;display:block;margin-top:2px;">Private Delivery Go</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1E293B;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#F8FAFC;color:#94A3B8;font-size:12px;">
                This is an automated message from Private Delivery Go. Please do not reply directly to this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function trackingLinkButton(url: string, label = "Track Your Delivery"): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:#F97316;border-radius:9999px;">
        <a href="${url}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-weight:700;text-decoration:none;font-size:14px;">${label}</a>
      </td>
    </tr>
  </table>`;
}
