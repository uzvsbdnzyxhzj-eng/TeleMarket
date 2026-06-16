const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /async function sendEmailNotification[\s\S]*?app\.post\("\/api\/notify"/;

const replacement = `async function sendEmailNotification(to: string, subject: string, type: string, details: any) {
  if (!to || !subject) return false;

  const getTemplate = (title: string, bodyContent: string) => \`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>\${title}</title>
      <style>
        body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { background-color: #111827; padding: 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
        .content { padding: 32px; font-size: 16px; line-height: 1.6; color: #374151; }
        .content h2 { color: #111827; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; }
        .details-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 24px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px dashed #e5e7eb; padding-bottom: 8px; }
        .detail-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { font-weight: 500; color: #111827; text-align: right; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; }
        .status-success { background-color: #d1fae5; color: #065f46; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-rejected { background-color: #fee2e2; color: #991b1b; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TELEMARKET</h1>
        </div>
        <div class="content">
          <h2>\${title}</h2>
          \${bodyContent}
          <p style="margin-top: 24px;">Thank you for choosing Telemarket.</p>
        </div>
        <div class="footer">
          <p>&copy; \${new Date().getFullYear()} Telemarket. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  \`;

  let title = subject;
  let bodyContent = "";

  const renderRow = (label: string, value: string) => \`
    <div class="detail-row">
      <span class="detail-label">\${label}</span>
      <span class="detail-value">\${value}</span>
    </div>
  \`;

  const getStatusBadge = (status: string) => {
    let lower = status.toLowerCase();
    if (lower.includes('paid') || lower.includes('success') || lower.includes('completed') || lower.includes('verified')) {
      return \`<span class="status-badge status-success">\${status}</span>\`;
    } else if (lower.includes('reject')) {
      return \`<span class="status-badge status-rejected">\${status}</span>\`;
    } else {
      return \`<span class="status-badge status-pending">\${status}</span>\`;
    }
  };
  
  if (type === "withdraw") {
    bodyContent = \`
      <p>We have successfully received your withdrawal request. It is currently under review by our team.</p>
      <div class="details-box">
        \${renderRow("Amount", '$' + details.amount)}
        \${renderRow("Method", details.method)}
        \${renderRow("Account Details", details.account)}
        \${renderRow("Status", getStatusBadge("Pending Review"))}
      </div>
      <p>You will receive another notification once the transaction has been processed.</p>
    \`;
  } else if (type === "withdraw_paid") {
    bodyContent = \`
      <p>Great news! Your withdrawal request has been successfully processed and the funds have been dispatched.</p>
      <div class="details-box">
        \${renderRow("Amount", '$' + details.amount)}
        \${renderRow("Method", details.method)}
        \${renderRow("Account Details", details.account || 'N/A')}
        \${renderRow("Status", getStatusBadge("Paid / Completed"))}
      </div>
    \`;
  } else if (type === "withdraw_rejected") {
    bodyContent = \`
      <p>Unfortunately, your recent withdrawal request could not be processed and has been rejected. Your balance has been refunded to your account.</p>
      <div class="details-box">
        \${renderRow("Amount", '$' + details.amount)}
        \${renderRow("Method", details.method)}
        \${renderRow("Status", getStatusBadge("Rejected / Refunded"))}
      </div>
      <p>If you have any questions, please contact our support team.</p>
    \`;
  } else if (type === "order") {
    bodyContent = \`
      <p>Your order has been successfully placed in our system and is currently being processed.</p>
      <div class="details-box">
        \${renderRow("Service", details.serviceName)}
        \${renderRow("Quantity", details.quantity)}
        \${renderRow("Total Charge", '$' + details.charge)}
        \${renderRow("Status", getStatusBadge("Processing"))}
      </div>
    \`;
  } else if (type === "order_completed") {
    bodyContent = \`
      <p>Your recent order has been successfully fulfilled.</p>
      <div class="details-box">
        \${renderRow("Service", details.serviceName)}
        \${renderRow("Quantity", details.quantity)}
        \${renderRow("Total Charge", '$' + details.charge)}
        \${renderRow("Status", getStatusBadge("Completed"))}
      </div>
    \`;
  } else if (type === "topup") {
    const statusText = details.status || 'Pending Verification';
    bodyContent = \`
      <p>We have received your deposit request. It is currently awaiting verification.</p>
      <div class="details-box">
        \${renderRow("Amount", '$' + details.amount)}
        \${renderRow("Payment Method", details.method)}
        \${renderRow("Status", getStatusBadge(statusText))}
      </div>
      <p>We will notify you as soon as the funds are added to your balance.</p>
    \`;
  } else if (type === "topup_success") {
    bodyContent = \`
      <p>Your deposit has been successfully verified and added to your wallet balance.</p>
      <div class="details-box">
        \${renderRow("Amount added", '$' + details.amount)}
        \${renderRow("Payment Method", details.method)}
        \${renderRow("Status", getStatusBadge("Verified"))}
      </div>
    \`;
  } else if (type === "topup_rejected") {
    bodyContent = \`
      <p>We were unable to verify your recent deposit request, and it has been rejected.</p>
      <div class="details-box">
        \${renderRow("Amount claimed", '$' + details.amount)}
        \${renderRow("Payment Method", details.method)}
        \${renderRow("Status", getStatusBadge("Rejected"))}
      </div>
      <p>Please ensure all details were correct, or contact support for assistance.</p>
    \`;
  } else if (type === "child_panel") {
    bodyContent = \`
      <p>Congratulations! Your Child Panel order has been successfully provisioned.</p>
      <div class="details-box">
        \${renderRow("Domain", details.domain)}
        \${renderRow("Monthly Price", '$' + details.price)}
        \${renderRow("Status", getStatusBadge("Active (Requires NS change)"))}
      </div>
      <p>Please configure your nameservers to point to our systems to activate your panel.</p>
    \`;
  } else if (type === "new_login") {
    bodyContent = \`
      <p>We noticed a new login to your Telemarket account from an unrecognized device or browser.</p>
      <div class="details-box">
        \${renderRow("Device Info", details.userAgent || 'Unknown Device')}
        \${renderRow("Date & Time", new Date().toLocaleString())}
      </div>
      <p style="color: #991b1b; background-color: #fee2e2; padding: 12px; border-radius: 6px; font-weight: 500; font-size: 14px;">
        If this was you, you can safely ignore this email. If you did not authorize this login, please secure your account by changing your password immediately.
      </p>
    \`;
  }

  const htmlContent = getTemplate(title, bodyContent);

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      await transporter.sendMail({
        from: \`"Telemarket" <\${process.env.SMTP_USER}>\`,
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

  app.post("/api/notify"`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched successfully");
