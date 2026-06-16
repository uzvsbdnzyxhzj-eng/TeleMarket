const fs = require('fs');

const fixAds = (file) => {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes("useCurrency")) {
    code = code.replace(
      `import { db } from "./firebase";`,
      `import { db } from "./firebase";\nimport { useCurrency } from "./CurrencyContext";`
    );
  }

  if (file.includes('MyAdsProfile')) {
    code = code.replace(
      /export default function MyAdsProfile\(\{ currentUser, onNavigate \}: \{ currentUser: any, onNavigate: \(view: string\) => void \}\) \{/,
      `export default function MyAdsProfile({ currentUser, onNavigate }: { currentUser: any, onNavigate: (view: string) => void }) {\n  const { formatCurrency } = useCurrency();`
    );
    
    code = code.replace(
      /months \$27/g, `months {formatCurrency(27)}`
    );
    code = code.replace(
      /for \$\$\{plan.price\}\?/g, `for \${formatCurrency(plan.price)}?`
    );
    code = code.replace(
      /Month \(\$27\)/g, `Month ({formatCurrency(27)})`
    );
    code = code.replace(
      /Months \(\$78\)/g, `Months ({formatCurrency(78)})`
    );
    code = code.replace(
      /Months \(\$132\)/g, `Months ({formatCurrency(132)})`
    );
    code = code.replace(
      /Months \(\$180\)/g, `Months ({formatCurrency(180)})`
    );
  }

  if (file.includes('PostAd')) {
     code = code.replace(
      /export default function PostAd\(\{ currentUser, balanceUSD, setTopupModal, setCurrentView \}: PostAdProps\) \{/,
      `export default function PostAd({ currentUser, balanceUSD, setTopupModal, setCurrentView }: PostAdProps) {\n  const { formatCurrency } = useCurrency();`
    );

    code = code.replace(
      /<span className="text-gray-400 line-through text-sm font-medium">\$(\{p.price\})<\/span>/g,
      '<span className="text-gray-400 line-through text-sm font-medium">{formatCurrency($1)}</span>'
    );
    code = code.replace(
      /<span className=\{`text-3xl font-black \$\{selectedPlan === p.months \? 'text-indigo-700' : 'text-indigo-600'\}`\}>\$(\{p.finalPrice\})<\/span>/g,
      '<span className={`text-3xl font-black ${selectedPlan === p.months ? \'text-indigo-700\' : \'text-indigo-600\'}`}>{formatCurrency($1)}</span>'
    );
    code = code.replace(
      /\{plan\.finalPrice\}/g,
      'plan.finalPrice'
    );
    code = code.replace(
      /<p className="text-3xl font-black">\$plan\.finalPrice<\/p>/g,
      '<p className="text-3xl font-black">{formatCurrency(plan.finalPrice)}</p>'
    );
    code = code.replace(
      /<p className=\{`text-2xl font-black \$\{balanceUSD < plan\.finalPrice \? 'text-red-500' : 'text-green-600'\}`\}>\n\s+\$\{\(balanceUSD > 0 && balanceUSD < 0\.01 \? balanceUSD\.toFixed\(4\) : balanceUSD\.toFixed\(2\)\)\}\n\s+<\/p>/g,
      '<p className={`text-2xl font-black ${balanceUSD < plan.finalPrice ? \'text-red-500\' : \'text-green-600\'}`}>\n                {formatCurrency(balanceUSD)}\n              </p>'
    );
  }

  fs.writeFileSync(file, code);
}

fixAds('src/MyAdsProfile.tsx');
fixAds('src/PostAd.tsx');
