const fs = require('fs');
let code = fs.readFileSync('src/ChildPanel.tsx', 'utf8');

const target = `      toast.success("Child panel successfully activated! Please update your nameservers.");`;
const notify = `      try {
        await fetch("/api/notify", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
              to: currentUser.email,
              subject: "Child Panel Activated - Telemarket",
              type: "child_panel",
              details: {
                 domain: domain.trim(),
                 price: INITIAL_PRICE
              }
           })
        });
      } catch(e) {
        console.error("Failed to notify:", e);
      }
      
      toast.success("Child panel successfully activated! Please update your nameservers.");`;

if (code.includes(target)) {
    code = code.replace(target, notify);
    fs.writeFileSync('src/ChildPanel.tsx', code);
    console.log("Patched ChildPanel.tsx successfully.");
} else {
    console.log("Could not find target in ChildPanel.tsx");
}
