const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace('import AdminUserManagement from "./AdminUserManagement";\\nimport AdminSMMPricing from "./AdminSMMPricing";', 'import AdminUserManagement from "./AdminUserManagement";\\nimport AdminSMMPricing from "./AdminSMMPricing";');
content = content.replace('<AdminUserManagement />\\n', '<AdminUserManagement />\\n');

// Also need to check if there are any other literal backslash n
content = content.split('\\\\n').join('\\n');

fs.writeFileSync('src/App.tsx', content);
