const fs = require('fs');
let code = fs.readFileSync('src/SocialServices.tsx', 'utf8');

const target = `               updateDoc(doc(db, "users", currentUser?.uid || ""), {
                   balanceUSD: increment(-Number(charge)),
                   total_spent: increment(Number(charge)),
                   last_update: Date.now()
               })
           ]);`;

const notifyOrder = `               updateDoc(doc(db, "users", currentUser?.uid || ""), {
                   balanceUSD: increment(-Number(charge)),
                   total_spent: increment(Number(charge)),
                   last_update: Date.now()
               })
           ]);

           try {
              await fetch("/api/notify", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
                    to: currentUser?.email,
                    subject: "Order Confirmation - Telemarket",
                    type: "order",
                    details: {
                       serviceName: selectedService.name,
                       charge: charge,
                       quantity: quantity
                    }
                 })
              });
           } catch(err) {
              console.error("Failed to send order email:", err);
           }`;

if (code.includes(target)) {
    code = code.replace(target, notifyOrder);
    fs.writeFileSync('src/SocialServices.tsx', code);
    console.log("Patched SocialServices.tsx successfully.");
} else {
    console.log("Could not find target in SocialServices.tsx");
}
