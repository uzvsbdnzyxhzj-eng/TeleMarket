const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import AdminSMMPricing from "./AdminSMMPricing"')) {
    content = content.replace('import AdminUserManagement from "./AdminUserManagement";', 'import AdminUserManagement from "./AdminUserManagement";\\nimport AdminSMMPricing from "./AdminSMMPricing";');
}

if (!content.includes('const [smmMarkupData, setSmmMarkupData]')) {
    content = content.replace('const [socialMarkupPercent, setSocialMarkupPercent] = useState(25);', 'const [socialMarkupPercent, setSocialMarkupPercent] = useState(25);\\n  const [smmMarkupData, setSmmMarkupData] = useState<Record<string, any>>({});');
}

if (!content.includes('doc(db, "settings", "smm_markup")')) {
    const hookStr = `  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "smm_markup"), (docSnap) => {
      if (docSnap.exists()) {
        setSmmMarkupData(docSnap.data());
      }
    });
    return () => unsub();
  }, []);`;
  
    content = content.replace('// Load global markup', hookStr + '\\n\\n  // Load global markup');
}

content = content.replace('<SocialServices currentUser={currentUser} onNavigate={setCurrentView} balanceUSD={balanceUSD} socialMarkupPercent={socialMarkupPercent} />', '<SocialServices currentUser={currentUser} onNavigate={setCurrentView} balanceUSD={balanceUSD} socialMarkupPercent={socialMarkupPercent} smmMarkupData={smmMarkupData} />');

if (!content.includes('<AdminSMMPricing')) {
    const smmAdminTag = `
            <AdminSMMPricing socialMarkupPercent={socialMarkupPercent} />
`;
    content = content.replace('<AdminUserManagement />', '<AdminUserManagement />\\n' + smmAdminTag);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Patched App.tsx');
