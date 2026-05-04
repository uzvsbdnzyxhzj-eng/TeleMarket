import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const file = fs.readFileSync("src/i18n.ts", "utf-8");

// Extract the 'en' object
const enStart = file.indexOf("en: {") + 4;
let brackets = 1;
let curr = enStart + 1;
while(brackets > 0 && curr < file.length) {
    if(file[curr] === '{') brackets++;
    if(file[curr] === '}') brackets--;
    curr++;
}
const enStr = file.substring(enStart, curr);
// Convert strictly to a JSON-like object by parsing as module
const getEn = new Function("return " + enStr);
const enObj = getEn();

const langs = ['hi', 'es', 'ar', 'ru', 'pt', 'fr', 'de', 'zh', 'ja', 'ko', 'tr', 'id', 'ur', 'it', 'nl', 'pl', 'vi', 'th'];

const prompt = `Translate the following JSON object to the specified language. Keep keys exactly the same. Return ONLY valid JSON, no markdown blocks.`;

async function main() {
  const result: Record<string, any> = { en: enObj, bn: getEn() }; // Note: BN is already there, but we won't touch it. We rely on the existing bn.
  
  // Actually, bn is translated already. We just want to translate the others.
  for(let lang of langs) {
     console.log("Translating", lang);
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt + " Language (ISO Code): " + lang + "\n\n" + JSON.stringify(enObj)
     });
     let text = response.text || "{}";
     text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
     try {
       result[lang] = JSON.parse(text);
     } catch(e) {
       console.error("Failed", lang, e);
     }
  }
  
  // write back
  let out = `export type Language = 'en' | 'bn' | 'hi' | 'es' | 'ar' | 'ru' | 'pt' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'tr' | 'id' | 'ur' | 'it' | 'nl' | 'pl' | 'vi' | 'th';\n\n`;
  out += `const rawTranslations: Record<Language, any> = {\n`;
  out += `  en: ` + JSON.stringify(enObj, null, 2) + `,\n`;
  
  // For bn we re-extract from the original
  const bnStart = file.indexOf("bn: {");
  if(bnStart !== -1) {
    let brackets2 = 1;
    let curr2 = bnStart + 4;
    while(brackets2 > 0 && curr2 < file.length) {
        if(file[curr2] === '{') brackets2++;
        if(file[curr2] === '}') brackets2--;
        curr2++;
    }
    const bnStr = file.substring(bnStart + 4, curr2);
    out += `  bn: ` + JSON.stringify(new Function("return " + bnStr)(), null, 2) + `,\n`;
  }
  
  for(let lang of langs) {
    if(result[lang]) {
        out += `  ${lang}: ` + JSON.stringify(result[lang], null, 2) + `,\n`;
    }
  }
  
  out += `};\n\n`;
  out += `export const t: Record<Language, any> = new Proxy(rawTranslations, {\n`;
  out += `  get(target, langProp) {\n`;
  out += `    if (typeof langProp !== "string") return (target as any)[langProp];\n`;
  out += `    const langRaw = target[langProp as Language];\n`;
  out += `    if (!langRaw) return target.en;\n`;
  out += `    return new Proxy(langRaw, {\n`;
  out += `      get(langTarget, key) {\n`;
  out += `        if (langTarget[key] !== undefined) {\n`;
  out += `          return langTarget[key];\n`;
  out += `        }\n`;
  out += `        return target.en[key];\n`;
  out += `      }\n`;
  out += `    });\n`;
  out += `  }\n`;
  out += `});\n`;
  
  fs.writeFileSync("src/i18n.ts", out);
}
main();
