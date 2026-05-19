const test = async () => {
    try {
        const res = await fetch("https://uday.paymently.io");
        console.log("Status:", res.status);
    } catch (e) {
        console.error("Error:", e.message);
    }
};
test();
