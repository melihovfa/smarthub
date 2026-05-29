const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const sources = [
  { name: 'OpenAI', category: 'AI', url: 'https://openai.com/news/rss.xml' },
  { name: 'Google DeepMind', category: 'AI', url: 'https://deepmind.google/blog/rss.xml' },
  { name: 'GitHub Blog', category: 'Разработка', url: 'https://github.blog/feed/' },
  { name: 'Hugging Face', category: 'AI', url: 'https://huggingface.co/blog/feed.xml' }
];

const outFile = path.join(__dirname, '..', 'data', 'posts.json');
const parser = new XMLParser({ ignoreAttributes: false });

function clean(text = '') {
  return String(text).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeItem(item, source) {
  const title = clean(item.title);
  const summary = clean(item.description || item.summary || item['content:encoded'] || '').slice(0, 180);
  const url = typeof item.link === 'string' ? item.link : item.link?.['@_href'] || source.url;
  const rawDate = item.pubDate || item.published || item.updated || new Date().toISOString();
  const date = new Date(rawDate).toISOString().slice(0, 10);
  return { title, summary: summary || `Материал от ${source.name}`, category: source.category, date, url };
}

async function loadFeed(source) {
  try {
    const response = await fetch(source.url, { headers: { 'User-Agent': 'SmartHubBot/1.0' } });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const xml = await response.text();
    const data = parser.parse(xml);
    const items = data.rss?.channel?.item || data.feed?.entry || [];
    return (Array.isArray(items) ? items : [items]).slice(0, 5).map(item => normalizeItem(item, source));
  } catch (error) {
    console.log(`Не удалось загрузить ${source.name}: ${error.message}`);
    return [];
  }
}

async function main() {
  const current = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : [];
  const fresh = (await Promise.all(sources.map(loadFeed))).flat();
  const map = new Map();
  [...fresh, ...current].forEach(post => {
    if (post.title && !map.has(post.url)) map.set(post.url, post);
  });
  const posts = [...map.values()].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 60);
  fs.writeFileSync(outFile, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`Обновлено публикаций: ${posts.length}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
