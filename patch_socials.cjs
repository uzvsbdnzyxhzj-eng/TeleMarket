const fs = require('fs');
let content = fs.readFileSync('src/SocialServices.tsx', 'utf8');

content = content.replace('socialMarkupPercent: number;', 'socialMarkupPercent: number;\\n  smmMarkupData?: Record<string, any>;');
content = content.replace(' socialMarkupPercent = 25 }: SocialServicesProps', ' socialMarkupPercent = 25, smmMarkupData = {} }: SocialServicesProps');
content = content.replace('  }, [socialMarkupPercent]);', '  }, [socialMarkupPercent, smmMarkupData]);');

const oldMarkupDataLogic = `        const markupData = data.map(s => ({
            ...s,
            rate: (parseFloat(s.rate) * (1 + (socialMarkupPercent / 100))).toFixed(4),
            originalRate: s.rate
        }));`;

const newMarkupDataLogic = `        const markupData = data.map(s => {
            let finalRate = parseFloat(s.rate);
            const override = smmMarkupData[s.service];
            
            if (override && override.type === 'fixed') {
                finalRate = finalRate + override.profit;
            } else {
                finalRate = finalRate + (finalRate * socialMarkupPercent / 100);
            }
            
            return {
                ...s,
                rate: finalRate.toFixed(4),
                originalRate: s.rate
            };
        });`;

content = content.replace(oldMarkupDataLogic, newMarkupDataLogic);

fs.writeFileSync('src/SocialServices.tsx', content);
console.log('Patched');
