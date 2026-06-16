const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regexTemplate = /const getTemplate = \([\s\S]*?<\/html>\n  \`;/;

const newTemplate = `const getTemplate = (title: string, bodyContent: string) => \`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>\${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 40px 20px; color: #000000; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; }
        .header { padding: 40px 20px 30px; text-align: center; border-bottom: 1px solid #cbd5e1; }
        .header h1 { color: #ea4335; margin: 0; font-size: 42px; font-weight: 700; letter-spacing: -2px; }
        .content { padding: 40px 40px 50px; font-size: 18px; line-height: 1.6; color: #1e293b; }
        .content h2 { color: #0f172a; font-size: 28px; font-weight: 700; margin-top: 0; margin-bottom: 30px; line-height: 1.3;}
        .content p { margin: 0 0 20px 0; }
        .content p strong { color: #000000; }
        .details-box { margin: 30px 0; font-size: 16px; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #0f172a; width: 45%; display: inline-block; vertical-align: top; }
        .detail-value { font-weight: 400; color: #334155; width: 50%; display: inline-block; text-align: right; vertical-align: top; }
        .status-badge { font-weight: 700; }
        .status-success { color: #16a34a; }
        .status-pending { color: #d97706; }
        .status-rejected { color: #dc2626; }
        .footer-links { text-align: center; padding: 40px 20px; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
        .footer-link-item { display: block; margin-bottom: 24px; font-weight: 400; color: #000000; text-decoration: underline; font-size: 18px; }
        .footer-link-item:last-child { margin-bottom: 0; }
        .footer-link-icon { color: #ea4335; margin-right: 12px; font-weight: normal; font-size: 20px; text-decoration: none; display: inline-block;}
        .footer-legal { max-width: 600px; margin: 0 auto; padding: 40px 20px; font-size: 15px; line-height: 1.6; color: #1e293b; background-color: #f4f5f7; }
        .footer-legal p { margin: 0 0 20px 0; }
        .footer-legal a { color: #64748b; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>telemarket</h1>
        </div>
        <div class="content">
          <h2>\${title}</h2>
          \${bodyContent}
        </div>
        <div class="footer-links">
          <a href="#" class="footer-link-item"><span class="footer-link-icon" style="text-decoration:none;">📖</span> Sign in</a>
          <a href="#" class="footer-link-item"><span class="footer-link-icon" style="text-decoration:none;">🎧</span> Get support</a>
          <a href="#" class="footer-link-item"><span class="footer-link-icon" style="text-decoration:none;">📱</span> Get the app</a>
        </div>
      </div>
      <div class="footer-legal">
        <p>Telemarket is an affiliated brand of Global Services.</p>
        <p>Telemarket is authorised to carry out digital marketplace activities and provide related services. The wallet associated with your account is provided by Telemarket Services Limited, which is highly regulated to ensure the utmost safety of your transactions and assets.</p>
        <p>These materials are for general information purposes only and are not investment advice. The unpredictable nature of the digital markets can lead to loss of funds. Tax may be payable on any return and you should seek independent advice.</p>
        <p>Telemarket, Inc.<br>100 Digital St Suite 1250 Office 6, PMB A188, San Francisco, CA 94111<br><a href="#">Legal Disclosures and Licensing Information</a><br><a href="#">Privacy Notice</a></p>
      </div>
    </body>
    </html>
  \`;`;

code = code.replace(regexTemplate, newTemplate);

const renderRowTarget = /const renderRow = \([\s\S]*?\`;/;
const newRenderRow = `const renderRow = (label: string, value: string) => \`
    <div class="detail-row">
      <span class="detail-label">\${label}</span>
      <span class="detail-value">\${value}</span>
    </div>
  \`;`;

code = code.replace(renderRowTarget, newRenderRow);

fs.writeFileSync('server.ts', code);
console.log("Patched professional template.");
