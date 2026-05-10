const fs = require('fs');
let str = fs.readFileSync('src/App.tsx', 'utf8');

str = str.replace('import AdminUserManagement from "./AdminUserManagement";\\nimport AdminSMMPricing from "./AdminSMMPricing";', 'import AdminUserManagement from "./AdminUserManagement";\nimport AdminSMMPricing from "./AdminSMMPricing";');
str = str.replace('<AdminUserManagement />\\n', '<AdminUserManagement />\n');

fs.writeFileSync('src/App.tsx', str);
