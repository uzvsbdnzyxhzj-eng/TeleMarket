const fs = require('fs');

let content = fs.readFileSync('src/Login.tsx', 'utf8');

const newCode = `{[
                  { name: 'Facebook', slug: 'facebook' },
                  { name: 'Instagram', slug: 'instagram' },
                  { name: 'TikTok', slug: 'tiktok' },
                  { name: 'YouTube', slug: 'youtube' },
                  { name: 'X', slug: 'x' },
                  { name: 'Telegram', slug: 'telegram' },
                  { name: 'WhatsApp', slug: 'whatsapp' },
                  { name: 'Threads', slug: 'threads' },
                  { name: 'Snapchat', slug: 'snapchat' },
                  { name: 'Pinterest', slug: 'pinterest' },
                  { name: 'LinkedIn', slug: 'linkedin' },
                  { name: 'Discord', slug: 'discord' },
                  { name: 'Reddit', slug: 'reddit' },
                  { name: 'Tumblr', slug: 'tumblr' },
                  { name: 'Quora', slug: 'quora' },
                  { name: 'Twitch', slug: 'twitch' },
                  { name: 'Kick', slug: 'kick' },
                  { name: 'Spotify', slug: 'spotify' },
                  { name: 'SoundCloud', slug: 'soundcloud' },
                  { name: 'Audiomack', slug: 'audiomack' },
                  { name: 'Deezer', slug: 'deezer' },
                  { name: 'Tidal', slug: 'tidal' },
                  { name: 'Vimeo', slug: 'vimeo' },
                  { name: 'Free Fire', src: 'https://seeklogo.com/images/F/free-fire-logo-1C9CFC4456-seeklogo.com.png' },
                  { name: 'PUBG', slug: 'pubg' },
                  { name: 'Mobile Legends', src: 'https://seeklogo.com/images/M/mobile-legends-logo-36203D0BEA-seeklogo.com.png' },
                  { name: 'Kwai', slug: 'kwai' },
                  { name: 'Likee', src: 'https://seeklogo.com/images/L/likee-logo-BA14DE99A3-seeklogo.com.png' },
                  { name: 'VK', slug: 'vk' },
                  { name: 'OK.ru', slug: 'odnoklassniki' },
                  { name: 'Lemon 8', slug: 'lemon8' },
                  { name: 'Coub', slug: 'coub', fallback: 'https://seeklogo.com/images/C/coub-logo-F91A2CA13B-seeklogo.com.png' },
                  { name: 'Shopee', slug: 'shopee' },
                  { name: 'Lazada', src: 'https://seeklogo.com/images/L/lazada-logo-66F232B25E-seeklogo.com.png' },
                  { name: 'Google', slug: 'google' },
                  { name: 'Traffic', src: 'https://cdn-icons-png.flaticon.com/512/3253/3253018.png' },
                  { name: 'Yandex', slug: 'yandex' },
                  { name: 'Reverbnation', slug: 'reverbnation' },
                ].map((social, idx) => (
                   <div key={idx} className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-[16px] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer hover:-translate-y-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-2 sm:mb-3">
                         <img 
                            src={social.src || (social.slug ? \`https://cdn.simpleicons.org/\${social.slug}\` : social.fallback)} 
                            alt={social.name} 
                            onError={(e) => {
                               if (social.fallback && e.currentTarget.src !== social.fallback) {
                                  e.currentTarget.src = social.fallback;
                               } else {
                                  e.currentTarget.src = 'https://cdn.simpleicons.org/web';
                               }
                            }}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-sm"
                         />
                      </div>
                      <span className="font-extrabold text-gray-800 text-[11px] sm:text-[13px] text-center leading-tight truncate w-full tracking-tight">{social.name}</span>
                   </div>
                ))}`;

const startIndex = content.indexOf("{[ \n                  { name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },");
const endIndex = content.indexOf("))}</div>", startIndex);
if (startIndex !== -1) {
    const end = content.indexOf("</div>", content.indexOf("))}", startIndex));
    const toreplace = content.substring(startIndex, end);
    content = content.replace(toreplace, newCode + '\n             ');
    fs.writeFileSync('src/Login.tsx', content);
    console.log('patched exactly');
} else {
    console.log('not found start index');
    console.log(content.substring(content.indexOf('Facebook') - 50, content.indexOf('Facebook') + 50));
}
