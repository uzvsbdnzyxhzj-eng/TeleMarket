import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace whatsapp
content = content.replace(/01706931471/g, '01644627304');

// replace cash out image
const svgBlock = `<svg
                      className="w-14 h-14 drop-shadow-md"
                      viewBox="0 0 64 64"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Roof Base */}
                      <path d="M4 26H60V30H4V26Z" fill="#4B5563" />
                      {/* Roof Triangle */}
                      <path d="M32 6L4 26H60L32 6Z" fill="#6B7280" />
                      {/* Pillars - Blue */}
                      <rect x="8" y="30" width="8" height="20" fill="#3B82F6" />
                      <rect x="28" y="30" width="8" height="20" fill="#3B82F6" />
                      <rect x="48" y="30" width="8" height="20" fill="#3B82F6" />
                      {/* Base Steps */}
                      <path d="M4 50H60V54H4V50Z" fill="#6B7280" />
                      <path d="M2 54H62V58H2V54Z" fill="#4B5563" />
                      {/* Gold Coin in the middle of Roof */}
                      <circle cx="32" cy="18" r="7" fill="#FBBF24" />
                      <path
                        d="M32 13V23M29 16.5C29 16.5 30 15 32 15C34 15 34.5 16.5 34.5 17.5C34.5 18.5 32.5 19 32 19C31.5 19 29.5 19.5 29.5 20.5C29.5 21.5 30 23 32 23C34 23 35 21 35 21"
                        stroke="#B45309"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>`;
const newImg = `<img src="https://img.icons8.com/3d-fluency/94/banknotes.png" alt="Cash Out" className="w-14 h-14 drop-shadow-md" />`;

content = content.replace(svgBlock, newImg);

fs.writeFileSync('src/App.tsx', content);
console.log("Done ES module replace things");
