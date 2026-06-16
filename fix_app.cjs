const fs = require('fs');
const file = 'src/App.tsx';
let code = fs.readFileSync(file, 'utf8');

// Hide banner in admin
code = code.replace(
  '<AdvertisementBanner onPostAdClick={() => requireAuth(() => setCurrentView("post-ad"))} />',
  '{currentView !== "admin" && <AdvertisementBanner onPostAdClick={() => requireAuth(() => setCurrentView("post-ad"))} />}'
);

// Add currency state
const statePattern = /const \[lang, setLang\] = useState<Language>\("en"\);/;
if (code.match(statePattern)) {
  code = code.replace(
    statePattern,
    `const [lang, setLang] = useState<Language>("en");
  const [currency, setCurrency] = useState("USD");
  const exchangeRates: Record<string, number> = { USD: 1, BDT: 120, INR: 83, EUR: 0.92, GBP: 0.79, PKR: 280, NGN: 1500, KES: 130 };
  const currencySymbols: Record<string, string> = { USD: "$", BDT: "৳", INR: "₹", EUR: "€", GBP: "£", PKR: "Rs", NGN: "₦", KES: "KSh" };
  const formatCurrency = (amount: number) => {
    const converted = amount * exchangeRates[currency];
    const formatted = converted > 0 && converted < 0.01 ? converted.toFixed(4) : converted.toFixed(2);
    return \`\${currencySymbols[currency]}\${formatted}\`;
  };`
  );
}

// Replace topnav language selector to include currency selector (mobile)
code = code.replace(
  /<select value={lang} onChange={\(e\) => setLang\(e\.target\.value as Language\)} className="bg-transparent border-none text-gray-700 outline-none cursor-pointer text-xs font-bold max-w-\[50px\]">([^]*?)<\/select>/,
  `$&
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent border-none text-gray-700 outline-none cursor-pointer text-xs font-bold w-[45px] ml-1">
                  {Object.keys(exchangeRates).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>`
);

// Replace topnav language selector to include currency selector (desktop)
code = code.replace(
  /<select value={lang} onChange={\(e\) => setLang\(e\.target\.value as Language\)} className="bg-transparent border-none text-gray-700 outline-none cursor-pointer text-xs font-bold max-w-\[80px\]">([^]*?)<\/select>/,
  `$&
                <div className="w-[1px] h-3 bg-gray-300 mx-1"></div>
                <span className="text-xs font-bold text-gray-500">{currencySymbols[currency]}</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent border-none text-gray-700 outline-none cursor-pointer text-xs font-bold max-w-[55px]">
                  {Object.keys(exchangeRates).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>`
);

// We need to replace these explicit ones correctly:

// 2362: <span className={`...`}>${(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))}</span>
code = code.replace(
  /\$<span className=\{([^]+?)\}>\$\{\(balanceUSD > 0 && balanceUSD < 0.01 \? balanceUSD.toFixed\(4\) : balanceUSD.toFixed\(2\)\)\}<\/span>/g,
  '<span className={$1}>{formatCurrency(balanceUSD)}</span>'
);

code = code.replace(
  />\$\{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\}</g,
  '>{formatCurrency(balanceUSD)}<'
);

code = code.replace(
  />\$\{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\} USD</g,
  '>{formatCurrency(balanceUSD)}<'
);

// 2984: Available Balance : {(balanceUSD...)} USD
code = code.replace(
  /Available Balance : \{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\} USD/g,
  'Available Balance : {formatCurrency(balanceUSD)} '
);

// 1689: {i18n.availWithdrawLbl} ${(balanceUSD...)}
code = code.replace(
  /\{i18n\.availWithdrawLbl\} \$\{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\}/g,
  '{i18n.availWithdrawLbl} {formatCurrency(balanceUSD)}'
);

// 3020: <div className="font-bold text-xl mb-1">{(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))} USD</div>
code = code.replace(
  /\{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\} USD/g,
  '{formatCurrency(balanceUSD)}'
);

// 3778: ${(balanceUSD > 0 && balanceUSD < 0.01 ? balanceUSD.toFixed(4) : balanceUSD.toFixed(2))}
// and then <span className="text-xl font-normal text-blue-200">USD</span>
code = code.replace(
  /\$\{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\}/g,
  '{formatCurrency(balanceUSD)}'
);

code = code.replace(
  /Balance: \$\{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\}/g,
  'Balance: {formatCurrency(balanceUSD)}'
);

// One more place: in the header, there's `>` next to `<span className={...}>$`
code = code.replace(
  /<span className=\{`font-bold text-sm inline-block transition-all duration-300 \$\{balanceAnimate \? 'scale-125 text-yellow-300' : ''\}`\}>\$\{formatCurrency\(balanceUSD\)\}<\/span>/g,
  '<span className={`font-bold text-sm inline-block transition-all duration-300 ${balanceAnimate ? \'scale-125 text-yellow-300\' : \'\'}`}>{formatCurrency(balanceUSD)}</span>'
);

fs.writeFileSync(file, code);
