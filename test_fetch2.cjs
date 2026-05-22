setTimeout(async () => {
    try {
        const res = await fetch('http://localhost:3000/api/admin/fixBalances');
        const text = await res.text();
        console.log(text);
    } catch(e) {
        console.error(e);
    }
}, 3000);
