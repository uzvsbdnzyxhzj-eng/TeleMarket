const fs = require('fs');

const fixCurrencies = (file) => {
  let code = fs.readFileSync(file, 'utf8');

  // Fix `$${charge}` where it uses string interpolation with $ initially
  code = code.replace(
    /<span className="text-blue-600 font-medium">\$(\{charge\})<\/span>/g,
    '<span className="text-blue-600 font-medium">{formatCurrency(Number($1))}</span>'
  );

  code = code.replace(
    /\$(\{s.rate\})/g,
    '{formatCurrency(Number($1))}'
  );

  if (file.includes('SocialServices')) {
    code = code.replace(
        `value={\`\${charge}\`}`,
        `value={charge ? formatCurrency(Number(charge)) : ""}`
    );
  }

  // Common UI replacements where price was hardcoded like $5.00
  // Mostly we'll let the agent just use formatCurrency for dynamically shown values.

  fs.writeFileSync(file, code);
}

fixCurrencies('src/SocialServices.tsx');
