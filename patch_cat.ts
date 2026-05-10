import fs from 'fs';
let content = fs.readFileSync('src/SocialServices.tsx', 'utf8');

content = content.replace(
  /import \{ ArrowLeft, Menu, X, Check, Search, PlusCircle, LayoutDashboard, List, ShoppingCart, Tag, Facebook, Youtube, Instagram, Twitter, Music, PlaySquare, Headphones, MessageCircle, Send, Cloud, Globe, Linkedin, Twitch \} from "lucide-react";/,
  'import { ArrowLeft, Menu, X, Check, Search, PlusCircle, LayoutDashboard, List, ShoppingCart, Tag, Facebook, Youtube, Instagram, Twitter, Music, PlaySquare, Headphones, MessageCircle, Send, Cloud, Globe, Linkedin, Twitch, Loader2 } from "lucide-react";'
);

const oldCatDropdown = `<div className="relative">
                         <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Category</label>
                         <div 
                            className="w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium cursor-pointer flex justify-between items-center"
                            onClick={() => {
                               setShowCategoryDropdown(!showCategoryDropdown);
                               setShowServiceDropdown(false);
                            }}
                         >
                            <div className="truncate text-sm pr-4 flex items-center gap-2">
                               {selectedCategory ? (
                                   <>
                                       {getCategoryIcon(selectedCategory)}
                                       <span className="truncate leading-snug">{selectedCategory}</span>
                                   </>
                               ) : "Select a category"}
                            </div>
                            <svg className={\`shrink-0 w-4 h-4 text-gray-500 transition-transform \${showCategoryDropdown ? 'rotate-180' : ''}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                         
                         {showCategoryDropdown && (`;

const newCatDropdown = `<div className="relative">
                         <label className="block text-[#1a1a1a] text-[15px] mb-2 pl-0.5">Category</label>
                         <div 
                            className="w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 font-medium cursor-pointer flex justify-between items-center"
                            onClick={() => {
                               if (services.length > 0) {
                                  setShowCategoryDropdown(!showCategoryDropdown);
                                  setShowServiceDropdown(false);
                               }
                            }}
                         >
                            <div className="truncate text-sm pr-4 flex items-center gap-2">
                               {services.length === 0 ? (
                                   <div className="flex items-center gap-2 text-gray-500 font-normal">
                                      <Loader2 className="w-4 h-4 animate-spin" /> Default loading...
                                   </div>
                               ) : selectedCategory ? (
                                   <>
                                       {getCategoryIcon(selectedCategory)}
                                       <span className="truncate leading-snug">{selectedCategory}</span>
                                   </>
                               ) : "Select a category"}
                            </div>
                            <svg className={\`shrink-0 w-4 h-4 text-gray-500 transition-transform \${showCategoryDropdown ? 'rotate-180' : ''}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                         
                         {showCategoryDropdown && services.length > 0 && (`;
content = content.replace(oldCatDropdown, newCatDropdown);

fs.writeFileSync('src/SocialServices.tsx', content);
