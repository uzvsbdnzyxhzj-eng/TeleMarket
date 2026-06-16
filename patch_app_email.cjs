const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const notifyWithdraw = `
                    try {
                      await fetch("/api/notify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          to: currentUser.email,
                          subject: "Withdrawal Request Received",
                          type: "withdraw",
                          details: {
                            amount: amountObj,
                            method: withdrawMethod,
                            account: withdrawDetails
                          }
                        })
                      });
                    } catch (err) {
                      console.error("Failed to notify:", err);
                    }
                    toast(i18n.withdrawSuccessTxt);
`;

code = code.replace(/toast\(i18n\.withdrawSuccessTxt\);/, notifyWithdraw);
fs.writeFileSync('src/App.tsx', code);
