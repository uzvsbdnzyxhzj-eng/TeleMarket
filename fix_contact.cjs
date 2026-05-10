const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove Facebook and YouTube from the grid (2 occurrences each)
const gridFacebook = `                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition">\n                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.48-10 10.02c0 5.01 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.54-4.5-10.02-10-10.02z"/></svg>\n                  <span className="font-bold text-gray-700">Facebook</span>\n                </a>\n`;

const gridYouTube = `                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition">\n                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.24 5 12 5 12 5s-6.24 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.76 2 12 2 12s0 3.24.42 4.81c.23.86.91 1.54 1.77 1.77C5.76 19 12 19 12 19s6.24 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.24 22 12 22 12s0-3.24-.42-4.81zM9.5 15.5v-7l6 3.5l-6 3.5z"/></svg>\n                  <span className="font-bold text-gray-700">YouTube</span>\n                </a>\n`;

code = code.split(gridFacebook).join('');
code = code.split(gridYouTube).join('');

code = code.replaceAll('<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">', '<div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">');

const listFacebook = `                \n                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">\n                   <div className="flex items-center gap-4">\n                     <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.48-10 10.02c0 5.01 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.54-4.5-10.02-10-10.02z"/></svg>\n                     <div>\n                       <h4 className="font-bold text-gray-800 flex items-center gap-1.5">Facebook HelpLine <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/20" /></h4>\n                       <p className="text-gray-500 text-sm mt-0.5">Available 24 hours / 7 days</p>\n                     </div>\n                   </div>\n                </a>\n`;

code = code.split(listFacebook).join('');

fs.writeFileSync('src/App.tsx', code);
console.log('App updated.');
