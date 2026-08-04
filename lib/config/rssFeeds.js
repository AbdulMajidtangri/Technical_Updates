export const RSS_FEEDS = [
  { id: "technology", name: "Technology", url: "https://rss.app/rss-feed?topicId=technology", category: "Technology", enabled: true, description: "General technology news" },
  { id: "business", name: "Business", url: "https://rss.app/rss-feed?topicId=business", category: "Business", enabled: true, description: "Business and corporate news" },
  { id: "spacex", name: "SpaceX", url: "https://rss.app/rss-feed?keyword=SpaceX&region=US&lang=en", category: "Space", enabled: true, description: "SpaceX and space industry news" },
  { id: "chatgpt", name: "ChatGPT", url: "https://rss.app/rss-feed?keyword=ChatGPT&region=US&lang=en", category: "Artificial Intelligence", enabled: true, description: "ChatGPT and conversational AI news" },
  { id: "gaming", name: "Gaming", url: "https://rss.app/rss-feed?keyword=Gaming&region=US&lang=en", category: "Gaming", enabled: true, description: "Gaming industry news" },
  { id: "personal-finance", name: "Personal Finance", url: "https://rss.app/rss-feed?keyword=Personal%20Finance&region=US&lang=en", category: "Finance", enabled: true, description: "Personal finance and money management" },
  { id: "google", name: "Google", url: "https://rss.app/rss-feed?keyword=Google&region=US&lang=en", category: "Technology", enabled: true, description: "Google company and product news" },
  { id: "microsoft", name: "Microsoft", url: "https://rss.app/rss-feed?keyword=Microsoft&region=US&lang=en", category: "Technology", enabled: true, description: "Microsoft company and product news" },
  { id: "apple", name: "Apple", url: "https://rss.app/rss-feed?keyword=Apple&region=US&lang=en", category: "Mobile", enabled: true, description: "Apple company and product news" },
  { id: "mental-health", name: "Mental Health", url: "https://rss.app/rss-feed?keyword=Mental%20Health&region=US&lang=en", category: "Health", enabled: true, description: "Mental health and wellness news" },
  { id: "travel", name: "Travel", url: "https://rss.app/rss-feed?keyword=Travel&region=US&lang=en", category: "Travel", enabled: true, description: "Travel industry news" },
  { id: "nasa", name: "NASA", url: "https://rss.app/rss-feed?keyword=NASA&region=US&lang=en", category: "Space", enabled: true, description: "NASA and space agency news" },
  { id: "global-warming", name: "Global Warming", url: "https://rss.app/rss-feed?keyword=Global%20Warming&region=US&lang=en", category: "Environment", enabled: true, description: "Climate change and environmental news" },
  { id: "islam", name: "Islam", url: "https://rss.app/rss-feed?keyword=Islam&region=US&lang=en", category: "Religion", enabled: true, description: "Islam-related news" },
];

export function getEnabledFeeds() {
  return RSS_FEEDS.filter((feed) => feed.enabled !== false);
}

export function getFeedById(id) {
  if (!id) return undefined;
  return RSS_FEEDS.find((feed) => feed.id === String(id).trim().toLowerCase());
}

export default RSS_FEEDS;