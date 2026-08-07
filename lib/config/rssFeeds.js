export const RSS_FEEDS = [
  { id: "technology", name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "Technology", enabled: true, description: "General technology news" },
  { id: "business", name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", category: "Business", enabled: true, description: "Business and corporate news" },
  { id: "spacex", name: "Space.com", url: "https://www.space.com/feeds/all", category: "Space", enabled: true, description: "SpaceX and space industry news" },
  { id: "chatgpt", name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", category: "Artificial Intelligence", enabled: true, description: "ChatGPT and AI news" },
  { id: "gaming", name: "IGN", url: "https://feeds.feedburner.com/ign/all", category: "Gaming", enabled: true, description: "Gaming industry news" },
  { id: "personal-finance", name: "CNBC Finance", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", category: "Finance", enabled: true, description: "Personal finance and markets" },
  { id: "google", name: "Google Blog", url: "https://blog.google/rss/", category: "Technology", enabled: true, description: "Google company and product news" },
  { id: "microsoft", name: "Microsoft News", url: "https://news.microsoft.com/source/feed/", category: "Technology", enabled: true, description: "Microsoft company news" },
  { id: "apple", name: "9to5Mac", url: "https://9to5mac.com/feed/", category: "Mobile", enabled: true, description: "Apple and mobile news" },
  { id: "mental-health", name: "Medical News Today", url: "https://www.medicalnewstoday.com/rss", category: "Health", enabled: true, description: "Mental health and wellness" },
  { id: "travel", name: "Lonely Planet", url: "https://www.lonelyplanet.com/news/rss", category: "Travel", enabled: true, description: "Travel industry news" },
  { id: "nasa", name: "NASA", url: "https://www.nasa.gov/rss/dynamic/breaking_news.rss", category: "Space", enabled: true, description: "NASA and space agency news" },
  { id: "global-warming", name: "Climate News", url: "https://www.theguardian.com/environment/climate-crisis/rss", category: "Environment", enabled: true, description: "Climate and environment news" },
  { id: "islam", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "Religion", enabled: true, description: "Global news including religion" },
];

export function getEnabledFeeds() {
  return RSS_FEEDS.filter((feed) => feed.enabled !== false);
}

export function getFeedById(id) {
  if (!id) return undefined;
  return RSS_FEEDS.find((feed) => feed.id === String(id).trim().toLowerCase());
}

export default RSS_FEEDS;