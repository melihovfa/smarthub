const fs = require('fs');
const path = require('path');

const token = process.env.MAX_BOT_TOKEN;
const chatId = process.env.MAX_CHAT_ID;
const siteUrl = process.env.SITE_URL || '';
const postsFile = path.join(__dirname, '..', 'data', 'posts.json');
const sentFile = path.join(__dirname, 'posted-max.json');

async function sendToMax(text) {
  if (!token || !chatId) {
    console.log('MAX_BOT_TOKEN или MAX_CHAT_ID не заданы. Публикация пропущена.');
    return false;
  }

  const response = await fetch('https://botapi.max.ru/messages', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MAX API error: ${response.status} ${body}`);
  }
  return true;
}

async function main() {
  const posts = JSON.parse(fs.readFileSync(postsFile, 'utf8'));
  const sent = fs.existsSync(sentFile) ? JSON.parse(fs.readFileSync(sentFile, 'utf8')) : [];
  const next = posts.find(post => !sent.includes(post.url));

  if (!next) {
    console.log('Новых публикаций для MAX нет.');
    return;
  }

  const link = siteUrl || next.url;
  const text = `🔥 ${next.title}\n\n${next.summary}\n\nЧитать: ${link}`;
  const ok = await sendToMax(text);
  if (ok) {
    sent.push(next.url);
    fs.writeFileSync(sentFile, JSON.stringify(sent.slice(-200), null, 2), 'utf8');
    console.log(`Отправлено в MAX: ${next.title}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
