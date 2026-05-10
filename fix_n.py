import fs
with open("src/App.tsx", "r") as f:
    text = f.read()

text = text.replace('import AdminUserManagement from "./AdminUserManagement";\\nimport AdminSMMPricing from "./AdminSMMPricing";', 'import AdminUserManagement from "./AdminUserManagement";\nimport AdminSMMPricing from "./AdminSMMPricing";')
text = text.replace('<AdminUserManagement />\\n', '<AdminUserManagement />\n')

with open("src/App.tsx", "w") as f:
    f.write(text)
