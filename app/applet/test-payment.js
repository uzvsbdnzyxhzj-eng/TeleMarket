async function test() {
   const response = await fetch("https://uday.paymently.icu/api/checkout-v2", {
       method: "POST",
       headers: {
           "Content-Type": "application/json",
           "RT-UDDOKTAPAY-API-KEY": "tmK3Qhnqo38AvMetmNAXv3cVvQR2P0weO9OqJqDg"
       },
       body: JSON.stringify({
           full_name: "User Topup",
           email: "customer@example.com",
           amount: "100.00",
           metadata: {
               user_id: "test",
               amount_usd: 10,
               type: "topup"
           },
           redirect_url: "http://localhost:3000/?payment=success",
           cancel_url: "http://localhost:3000/?payment=cancel",
           webhook_url: "http://localhost:3000/api/payment/webhook"
       })
   });
   
   const data = await response.json();
   console.log(data);
}
test();
