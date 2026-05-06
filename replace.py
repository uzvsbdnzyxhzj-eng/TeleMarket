import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace setTopupModal(true) in all onClick handlers
content = re.sub(r'onClick=\{\(\)\s*=>\s*\{\s*setTopupModal\(true\);\s*\}\}', r'onClick={() => { (window as any).triggerAdClick?.(); setTopupModal(true); }}', content)
content = re.sub(r'onClick=\{\(\)\s*=>\s*setTopupModal\(true\)\}', r'onClick={() => { (window as any).triggerAdClick?.(); setTopupModal(true); }}', content)
content = re.sub(r'onClick=\{\(\)\s*=>\s*\{\s*setTopupModal\(true\);\s*setIsMobileMenuOpen\(false\);\s*\}\}', r'onClick={() => { (window as any).triggerAdClick?.(); setTopupModal(true); setIsMobileMenuOpen(false); }}', content)

# Replace setCurrentView("buy")
content = re.sub(r'onClick=\{\(\)\s*=>\s*setCurrentView\("buy"\)\}', r'onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("buy"); }}', content)

# Replace setCurrentView("sell")
content = re.sub(r'onClick=\{\(\)\s*=>\s*setCurrentView\("sell"\)\}', r'onClick={() => { (window as any).triggerAdClick?.(); setCurrentView("sell"); }}', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Replaced successfully")
