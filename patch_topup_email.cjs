const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `toast("Your Order is submitted for review! It could not be instantly verified, an admin will review.");`;
const notify1 = `
                        try {
                           await fetch("/api/notify", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                 to: currentUser?.email,
                                 subject: "Deposit Request Received",
                                 type: "topup",
                                 details: {
                                    amount: enteredUSD.toFixed(2),
                                    method: "Binance Manual",
                                    status: "Pending Review"
                                 }
                              })
                           });
                        } catch (err) {}
                        toast("Your Order is submitted for review! It could not be instantly verified, an admin will review.");`;

const target2 = `toast("Binance Verified Instantly! Balance updated.");`;
const notify2 = `
                        try {
                           await fetch("/api/notify", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                 to: currentUser?.email,
                                 subject: "Deposit Successful",
                                 type: "topup",
                                 details: {
                                    amount: enteredUSD.toFixed(2),
                                    method: "Binance Auto",
                                    status: "Paid"
                                 }
                              })
                           });
                        } catch (err) {}
                        toast("Binance Verified Instantly! Balance updated.");`;
                        
code = code.replace(target1, notify1);
code = code.replace(target2, notify2);
fs.writeFileSync('src/App.tsx', code);
