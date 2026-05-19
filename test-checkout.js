import fetch from "node-fetch";
const test = async () => {
    try {
        const response = await fetch(
            "https://uday.paymently.io/api/checkout-v2",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "RT-UDDOKTAPAY-API-KEY": "6441dd895cf398dfca7cd06a92892994c65e2365",
              },
              body: JSON.stringify({
                full_name: "User Topup",
                email: "customer@example.com",
                amount: "10",
                metadata: {
                  user_id: "test",
                  amount_usd: "10",
                  type: "topup",
                },
                redirect_url: "http://localhost:3000/?payment=success",
                cancel_url: "http://localhost:3000/?payment=cancel",
                webhook_url: "http://localhost:3000/api/payment/webhook",
              }),
            }
          );
        const data = await response.json();
        console.log(data);
    } catch (e) {
        console.error("Error:", e.message);
    }
};
test();
