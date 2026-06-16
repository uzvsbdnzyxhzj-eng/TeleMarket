const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf8');

const startIndex = code.indexOf('async function sendEmailNotification(to: string, subject: string, type: string, details: any)');
const endIndex = code.indexOf('  app.post("/api/notify", async (req, res) => {');

if (startIndex !== -1 && endIndex !== -1) {
  const newFunction = `async function sendEmailNotification(to: string, subject: string, type: string, details: any) {
  if (!to || !subject) return false;

  const getTemplate = (title: string, bodyContent: string) => \\\`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>\\\${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 40px 20px; color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
        .header { padding: 40px 20px 30px; text-align: center; border-bottom: 1px solid #cbd5e1; }
        .header h1 { color: #3b71ca; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px; display: flex; align-items: center; justify-content: center; }
        .header-icon { display: inline-block; width: 32px; height: 32px; background-color: #3b71ca; border-radius: 6px; margin-right: 12px; position: relative; }
        .header-icon::after { content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 3px solid white; border-radius: 2px; }
        .content { padding: 40px 40px 50px; font-size: 16px; line-height: 1.6; color: #1e293b; }
        .content h2 { color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 24px; line-height: 1.3;}
        .content p { margin: 0 0 16px 0; }
        .content p strong { color: #000000; }
        .details-box { margin: 30px 0; font-size: 15px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;}
        .detail-row { padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #64748b; }
        .detail-value { font-weight: 600; color: #0f172a; text-align: right; }
        .status-badge { font-weight: 600; padding: 4px 10px; border-radius: 20px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .status-success { color: #15803d; background-color: #dcfce7; }
        .status-pending { color: #b45309; background-color: #fef3c7; }
        .status-rejected { color: #b91c1c; background-color: #fee2e2; }
        .security-alert { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; color: #991b1b; margin-top: 30px; border-radius: 0 8px 8px 0; font-weight: 500; font-size: 15px; }
        .footer-legal { max-width: 600px; margin: 0 auto; padding: 30px 20px; text-align: center; font-size: 14px; line-height: 1.6; color: #64748b; }
        .footer-legal p { margin: 0 0 10px 0; }
        .footer-legal a { color: #3b71ca; text-decoration: none; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1><div class="header-icon"></div> TELEMARKET</h1>
        </div>
        <div class="content">
          <h2>\\\${title}</h2>
          \\\${bodyContent}
          <p style="margin-top: 32px; font-weight: 500; color: #0f172a;">Thank you for choosing Telemarket.</p>
        </div>
      </div>
      <div class="footer-legal">
        <p>&copy; \\\${new Date().getFullYear()} Telemarket. All rights reserved.</p>
        <p>This email was sent by Telemarket to keep you updated on your account activity.</p>
      </div>
    </body>
    </html>
  \\\`;

  let title = subject;
  let bodyContent = "";

  const renderRow = (label: string, value: string) => \\\`
    <div class="detail-row">
      <span class="detail-label">\\\${label}</span>
      <span class="detail-value">\\\${value}</span>
    </div>
  \\\`;

  const getStatusBadge = (status: string) => {
    let lower = status.toLowerCase();
    if (lower.includes('paid') || lower.includes('success') || lower.includes('completed') || lower.includes('verified')) {
      return \\\`<span class="status-badge status-success">\\\${status}</span>\\\`;
    } else if (lower.includes('reject')) {
      return \\\`<span class="status-badge status-rejected">\\\${status}</span>\\\`;
    } else {
      return \\\`<span class="status-badge status-pending">\\\${status}</span>\\\`;
    }
  };
  
  if (type === "withdraw") {
    bodyContent = \\\`
      <p>We have received your withdrawal request. It is currently under review by our team.</p>
      <div class="details-box">
        \\\${renderRow("Amount", '$' + details.amount)}
        \\\${renderRow("Method", details.method || 'System')}
        \\\${renderRow("Account Details", details.account || 'N/A')}
        \\\${renderRow("Status", getStatusBadge("Pending"))}
      </div>
    \\\`;
  } else if (type === "withdraw_paid") {
    bodyContent = \\\`
      <p>Your withdrawal request has been successfully processed and the funds have been dispatched.</p>
      <div class="details-box">
        \\\${renderRow("Amount", '$' + details.amount)}
        \\\${renderRow("Method", details.method || 'System')}
        \\\${renderRow("Account Details", details.account || 'N/A')}
        \\\${renderRow("Status", getStatusBadge("Paid"))}
      </div>
    \\\`;
  } else if (type === "withdraw_rejected") {
    bodyContent = \\\`
      <p>Unfortunately, your recent withdrawal request could not be processed and has been rejected. Your balance has been refunded.</p>
      <div class="details-box">
        \\\${renderRow("Amount", '$' + details.amount)}
        \\\${renderRow("Method", details.method || 'System')}
        \\\${renderRow("Status", getStatusBadge("Rejected"))}
      </div>
    \\\`;
  } else if (type === "order") {
    bodyContent = \\\`
      <p>Your order has been successfully placed in our system and is currently being processed.</p>
      <div class="details-box">
        \\\${renderRow("Service", details.serviceName)}
        \\\${renderRow("Quantity", details.quantity)}
        \\\${renderRow("Total Charge", '$' + details.charge)}
        \\\${renderRow("Status", getStatusBadge("Processing"))}
      </div>
    \\\`;
  } else if (type === "order_completed") {
    bodyContent = \\\`
      <p>Your recent order has been successfully fulfilled.</p>
      <div class="details-box">
        \\\${renderRow("Service", details.serviceName)}
        \\\${renderRow("Quantity", details.quantity)}
        \\\${renderRow("Total Charge", '$' + details.charge)}
        \\\${renderRow("Status", getStatusBadge("Completed"))}
      </div>
    \\\`;
  } else if (type === "topup") {
    const statusText = details.status || 'Pending';
    bodyContent = \\\`
      <p>We have received your deposit request. It is currently awaiting verification.</p>
      <div class="details-box">
        \\\${renderRow("Amount", '$' + details.amount)}
        \\\${renderRow("Payment Method", details.method || 'System')}
        \\\${renderRow("Status", getStatusBadge(statusText))}
      </div>
    \\\`;
  } else if (type === "topup_success") {
    bodyContent = \\\`
      <p>Your deposit has been successfully verified and added to your wallet balance.</p>
      <div class="details-box">
        \\\${renderRow("Amount", '$' + details.amount)}
        \\\${renderRow("Payment Method", details.method || 'System')}
        \\\${renderRow("Status", getStatusBadge("Verified"))}
      </div>
    \\\`;
  } else if (type === "topup_rejected") {
    bodyContent = \\\`
      <p>We were unable to verify your recent deposit request, and it has been rejected.</p>
      <div class="details-box">
        \\\${renderRow("Amount", '$' + details.amount)}
        \\\${renderRow("Payment Method", details.method || 'System')}
        \\\${renderRow("Status", getStatusBadge("Rejected"))}
      </div>
    \\\`;
  } else if (type === "child_panel") {
    bodyContent = \\\`
      <p>Congratulations! Your Child Panel order has been successfully provisioned.</p>
      <div class="details-box">
        \\\${renderRow("Domain", details.domain)}
        \\\${renderRow("Price", '$' + details.price)}
        \\\${renderRow("Status", getStatusBadge("Active"))}
      </div>
    \\\`;
  } else if (type === "new_login") {
    bodyContent = \\\`
      <p>We noticed a new login to your Telemarket account from an unrecognized device or browser.</p>
      <div class="details-box">
        \\\${renderRow("Device", details.userAgent || 'Unknown Device')}
        \\\${renderRow("Time", new Date().toLocaleString())}
      </div>
      <div class="security-alert">
        আপনি না করে থাকলে দ্রুত পাসওয়ার্ড পরিবর্তন করুন!
        <br><br>
        (If you did not authorize this login, please secure your account by changing your password immediately!)
      </div>
    \\\`;
  }

  const htmlContent = getTemplate(title, bodyContent);

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await transporter.sendMail({
        from: \\\`"Telemarket" <\\\${process.env.SMTP_USER}>\\\`,
        to,
        subject,
        html: htmlContent,
      });
      console.log("Email sent successfully to", to);
      return true;
    } catch(err) {
      console.error("Failed to send email to", to, err);
      return false;
    }
  } else {
     console.warn("SMTP credentials not set, email simulated. Would have sent to: " + to);
     return false;
  }
}

`;

  const finalCode = code.substring(0, startIndex) + newFunction + code.substring(endIndex);
  fs.writeFileSync('server.ts', finalCode);
  console.log("Replaced block successfully");
} else {
  console.log("Could not find start or end index");
}
