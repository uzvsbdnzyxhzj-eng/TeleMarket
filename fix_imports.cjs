const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace('import AdminUserManagement from "./AdminUserManagement";\\\\nimport AdminSMMPricing from "./AdminSMMPricing";', 'import AdminUserManagement from "./AdminUserManagement";\\nimport AdminSMMPricing from "./AdminSMMPricing";');

// It's possible the original was "import AdminUserManagement from \\"./AdminUserManagement\\";\\\\nimport"
content = content.replace(/import AdminUserManagement from "\.\/AdminUserManagement";\\nimport AdminSMMPricing from "\.\/AdminSMMPricing";/g, 'import AdminUserManagement from "./AdminUserManagement";\\nimport AdminSMMPricing from "./AdminSMMPricing";');

fs.writeFileSync('src/App.tsx', content);
