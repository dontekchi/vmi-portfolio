const SURL = 'https://lcgzvzmpyxlafuwpgcxy.supabase.co';
const SKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjZ3p2em1weXhsYWZ1d3BnY3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MDYxMTIsImV4cCI6MjA5NTA4MjExMn0.jjGKNRKZfQAxpeUqcKPOwGqYo1gYC0rotNHt9buRukw';
const BOT = /facebookexternalhit|facebot|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|pinterest|skypeuripreview|applebot|googlebot|bingbot|embedly|vkshare|redditbot/i;
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export default async (request) => {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT.test(ua)) return;
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const id = url.searchParams.get('id');
  let query;
  if (id) query = 'id=eq.' + encodeURIComponent(id);
  else if (/^[a-z0-9-]{3,40}$/.test(slug)) query = 'slug=eq.' + encodeURIComponent(slug);
  else return;
  let p;
  try {
    const r = await fetch(SURL + '/rest/v1/portfolios?select=data&limit=1&' + query, {
      headers: { apikey: SKEY, Authorization: 'Bearer ' + SKEY },
    });
    const rows = await r.json();
    p = rows && rows[0] && rows[0].data;
  } catch (e) { return; }
  if (!p) return;
  const origin = url.origin;
  const title = (p.studentName || 'Video Editor') + ' | Video Portfolio';
  const desc = p.headline || p.subtitle || 'View my video editing and motion design portfolio.';
  let image = p.photo || '';
  if (!image || image.startsWith('data:')) image = origin + '/icon-512.png';
  else if (/res\.cloudinary\.com/.test(image) && image.includes('/upload/') && !image.includes('/upload/c_')) {
    image = image.replace('/upload/', '/upload/c_fill,w_800,h_420,g_auto,q_auto,f_jpg/');
  }
  const pageUrl = origin + url.pathname + url.search;
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
    '<title>' + esc(title) + '</title>' +
    '<meta name="description" content="' + esc(desc) + '">' +
    '<meta property="og:type" content="website">' +
    '<meta property="og:site_name" content="VMI Portfolio">' +
    '<meta property="og:title" content="' + esc(title) + '">' +
    '<meta property="og:description" content="' + esc(desc) + '">' +
    '<meta property="og:image" content="' + esc(image) + '">' +
    '<meta property="og:url" content="' + esc(pageUrl) + '">' +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<meta name="twitter:title" content="' + esc(title) + '">' +
    '<meta name="twitter:description" content="' + esc(desc) + '">' +
    '<meta name="twitter:image" content="' + esc(image) + '">' +
    '</head><body><h1>' + esc(title) + '</h1><p>' + esc(desc) + '</p></body></html>';
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
};
export const config = { path: '/*', excludedPath: ['/*.png', '/*.js', '/*.json', '/*.ico', '/*.css', '/*.svg', '/.netlify/*'] };
