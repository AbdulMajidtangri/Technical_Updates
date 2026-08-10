/**
 * RSS feed catalog — organized by category.
 * Toggle enabled: false to skip a feed without removing it.
 */
export const RSS_FEEDS = [
  // —— Artificial Intelligence ——
  { id: "vb-ai", name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", category: "Artificial Intelligence", enabled: true },
  { id: "openai-blog", name: "OpenAI Blog", url: "https://openai.com/blog/rss.xml", category: "Artificial Intelligence", enabled: true },
  { id: "mit-ai", name: "MIT Tech Review AI", url: "https://www.technologyreview.com/topic/artificial-intelligence/feed", category: "Artificial Intelligence", enabled: true },
  { id: "google-ai", name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", category: "Artificial Intelligence", enabled: true },
  { id: "ai-news", name: "AI News", url: "https://www.artificialintelligence-news.com/feed/", category: "Artificial Intelligence", enabled: true },

  // —— Software Development ——
  { id: "devto", name: "DEV Community", url: "https://dev.to/feed", category: "Software Development", enabled: true },
  { id: "github-blog", name: "GitHub Blog", url: "https://github.blog/feed/", category: "Software Development", enabled: true },
  { id: "stackoverflow-blog", name: "Stack Overflow Blog", url: "https://stackoverflow.blog/feed/", category: "Software Development", enabled: true },
  { id: "infoq", name: "InfoQ", url: "https://feed.infoq.com/", category: "Software Development", enabled: true },
  { id: "css-tricks", name: "CSS-Tricks", url: "https://css-tricks.com/feed/", category: "Software Development", enabled: true },

  // —— Technology ——
  { id: "techcrunch", name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "Technology", enabled: true },
  { id: "the-verge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "Technology", enabled: true },
  { id: "ars-technica", name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "Technology", enabled: true },
  { id: "wired", name: "Wired", url: "https://www.wired.com/feed/rss", category: "Technology", enabled: true },
  { id: "google-blog", name: "Google Blog", url: "https://blog.google/rss/", category: "Technology", enabled: true },
  { id: "microsoft-news", name: "Microsoft News", url: "https://news.microsoft.com/source/feed/", category: "Technology", enabled: true },
  { id: "the-register", name: "The Register", url: "https://www.theregister.com/headlines.atom", category: "Technology", enabled: true },
  { id: "engadget", name: "Engadget", url: "https://www.engadget.com/rss.xml", category: "Technology", enabled: true },

  // —— Business ——
  { id: "bbc-business", name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", category: "Business", enabled: true },
  { id: "reuters-business", name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews", category: "Business", enabled: true },
  { id: "fortune", name: "Fortune", url: "https://fortune.com/feed/", category: "Business", enabled: true },
  { id: "hbr", name: "Harvard Business Review", url: "https://hbr.org/feed", category: "Business", enabled: true },
  { id: "cnbc-top", name: "CNBC Top News", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", category: "Business", enabled: true },

  // —— Cybersecurity ——
  { id: "krebs", name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/", category: "Cybersecurity", enabled: true },
  { id: "hackernews-feed", name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews", category: "Cybersecurity", enabled: true },
  { id: "bleepingcomputer", name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/", category: "Cybersecurity", enabled: true },
  { id: "dark-reading", name: "Dark Reading", url: "https://www.darkreading.com/rss.xml", category: "Cybersecurity", enabled: true },
  { id: "schneier", name: "Schneier on Security", url: "https://www.schneier.com/feed/", category: "Cybersecurity", enabled: true },

  // —— Space ——
  { id: "space-com", name: "Space.com", url: "https://www.space.com/feeds/all", category: "Space", enabled: true },
  { id: "nasa", name: "NASA Breaking News", url: "https://www.nasa.gov/rss/dynamic/breaking_news.rss", category: "Space", enabled: true },
  { id: "esa", name: "European Space Agency", url: "https://www.esa.int/rssfeed/Our_Activities/Space_News", category: "Space", enabled: true },
  { id: "spacenews", name: "SpaceNews", url: "https://spacenews.com/feed/", category: "Space", enabled: true },

  // —— Science ——
  { id: "science-daily", name: "ScienceDaily", url: "https://www.sciencedaily.com/rss/all.xml", category: "Science", enabled: true },
  { id: "nature", name: "Nature", url: "https://www.nature.com/nature.rss", category: "Science", enabled: true },
  { id: "new-scientist", name: "New Scientist", url: "https://www.newscientist.com/feed/home/", category: "Science", enabled: true },
  { id: "bbc-science", name: "BBC Science", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "Science", enabled: true },

  // —— Gaming ——
  { id: "ign", name: "IGN", url: "https://feeds.feedburner.com/ign/all", category: "Gaming", enabled: true },
  { id: "kotaku", name: "Kotaku", url: "https://kotaku.com/rss", category: "Gaming", enabled: true },
  { id: "polygon", name: "Polygon", url: "https://www.polygon.com/rss/index.xml", category: "Gaming", enabled: true },
  { id: "eurogamer", name: "Eurogamer", url: "https://www.eurogamer.net/feed", category: "Gaming", enabled: true },
  { id: "rock-paper-shotgun", name: "Rock Paper Shotgun", url: "https://www.rockpapershotgun.com/feed", category: "Gaming", enabled: true },

  // —— Finance ——
  { id: "cnbc-finance", name: "CNBC Finance", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664", category: "Finance", enabled: true },
  { id: "marketwatch", name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", category: "Finance", enabled: true },
  { id: "yahoo-finance", name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "Finance", enabled: true },
  { id: "investopedia", name: "Investopedia", url: "https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline", category: "Finance", enabled: true },

  // —— Travel ——
  { id: "lonely-planet", name: "Lonely Planet", url: "https://www.lonelyplanet.com/news/rss", category: "Travel", enabled: true },
  { id: "skift", name: "Skift", url: "https://skift.com/feed/", category: "Travel", enabled: true },
  { id: "bbc-travel", name: "BBC Travel", url: "https://feeds.bbci.co.uk/news/travel/rss.xml", category: "Travel", enabled: true },

  // —— Environment ——
  { id: "guardian-climate", name: "Guardian Climate", url: "https://www.theguardian.com/environment/climate-crisis/rss", category: "Environment", enabled: true },
  { id: "bbc-environment", name: "BBC Environment", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", category: "Environment", enabled: true },
  { id: "grist", name: "Grist", url: "https://grist.org/feed/", category: "Environment", enabled: true },
  { id: "yale-e360", name: "Yale Environment 360", url: "https://e360.yale.edu/feed", category: "Environment", enabled: true },

  // —— Health ——
  { id: "medical-news-today", name: "Medical News Today", url: "https://www.medicalnewstoday.com/rss", category: "Health", enabled: true },
  { id: "who-news", name: "WHO News", url: "https://www.who.int/rss-feeds/news-english.xml", category: "Health", enabled: true },
  { id: "nih-news", name: "NIH News", url: "https://www.nih.gov/news-events/news-releases/rss.xml", category: "Health", enabled: true },
  { id: "bbc-health", name: "BBC Health", url: "https://feeds.bbci.co.uk/news/health/rss.xml", category: "Health", enabled: true },

  // —— World News ——
  { id: "bbc-world", name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "World News", enabled: true },
  { id: "reuters-world", name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews", category: "World News", enabled: true },
  { id: "npr-world", name: "NPR World", url: "https://feeds.npr.org/1004/rss.xml", category: "World News", enabled: true },
  { id: "al-jazeera", name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "World News", enabled: true },
  { id: "guardian-world", name: "Guardian World", url: "https://www.theguardian.com/world/rss", category: "World News", enabled: true },

  // —— Politics ——
  { id: "bbc-politics", name: "BBC Politics", url: "https://feeds.bbci.co.uk/news/politics/rss.xml", category: "Politics", enabled: true },
  { id: "politico", name: "Politico", url: "https://rss.politico.com/politics-news.xml", category: "Politics", enabled: true },
  { id: "the-hill", name: "The Hill", url: "https://thehill.com/feed/", category: "Politics", enabled: true },
  { id: "guardian-politics", name: "Guardian Politics", url: "https://www.theguardian.com/politics/rss", category: "Politics", enabled: true },

  // —— Sports ——
  { id: "bbc-sport", name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "Sports", enabled: true },
  { id: "espn", name: "ESPN", url: "https://www.espn.com/espn/rss/news", category: "Sports", enabled: true },
  { id: "sky-sports", name: "Sky Sports", url: "https://www.skysports.com/rss/12040", category: "Sports", enabled: true },
  { id: "guardian-sport", name: "Guardian Sport", url: "https://www.theguardian.com/sport/rss", category: "Sports", enabled: true },

  // —— Entertainment ——
  { id: "bbc-entertainment", name: "BBC Entertainment", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", category: "Entertainment", enabled: true },
  { id: "variety", name: "Variety", url: "https://variety.com/feed/", category: "Entertainment", enabled: true },
  { id: "hollywood-reporter", name: "Hollywood Reporter", url: "https://www.hollywoodreporter.com/feed/", category: "Entertainment", enabled: true },
  { id: "rolling-stone", name: "Rolling Stone", url: "https://www.rollingstone.com/feed/", category: "Entertainment", enabled: true },

  // —— Education ——
  { id: "edsurge", name: "EdSurge", url: "https://www.edsurge.com/articles_rss", category: "Education", enabled: true },
  { id: "inside-higher-ed", name: "Inside Higher Ed", url: "https://www.insidehighered.com/rss.xml", category: "Education", enabled: true },
  { id: "chronicle-he", name: "Chronicle of Higher Education", url: "https://www.chronicle.com/section/Home/5/rss", category: "Education", enabled: true },

  // —— Religion ——
  { id: "religion-news", name: "Religion News Service", url: "https://religionnews.com/feed/", category: "Religion", enabled: true },
  { id: "bbc-religion", name: "BBC Religion", url: "https://feeds.bbci.co.uk/news/religion_and_ethics/rss.xml", category: "Religion", enabled: true },

  // —— Mobile ——
  { id: "9to5mac", name: "9to5Mac", url: "https://9to5mac.com/feed/", category: "Mobile", enabled: true },
  { id: "android-authority", name: "Android Authority", url: "https://www.androidauthority.com/feed/", category: "Mobile", enabled: true },
  { id: "9to5google", name: "9to5Google", url: "https://9to5google.com/feed/", category: "Mobile", enabled: true },
  { id: "gsmarena", name: "GSMArena", url: "https://www.gsmarena.com/rss-news-reviews.php3", category: "Mobile", enabled: true },

  // —— Cloud & DevOps ——
  { id: "aws-blog", name: "AWS News Blog", url: "https://aws.amazon.com/blogs/aws/feed/", category: "Cloud & DevOps", enabled: true },
  { id: "docker-blog", name: "Docker Blog", url: "https://www.docker.com/blog/feed/", category: "Cloud & DevOps", enabled: true },
  { id: "kubernetes-blog", name: "Kubernetes Blog", url: "https://kubernetes.io/feed.xml", category: "Cloud & DevOps", enabled: true },
  { id: "devops-com", name: "DevOps.com", url: "https://devops.com/feed/", category: "Cloud & DevOps", enabled: true },

  // —— Hardware ——
  { id: "tomshardware", name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all", category: "Hardware", enabled: true },
  { id: "anandtech", name: "AnandTech", url: "https://www.anandtech.com/rss/", category: "Hardware", enabled: true },
  { id: "pcworld", name: "PCWorld", url: "https://www.pcworld.com/index.rss", category: "Hardware", enabled: true },
  { id: "extremetech", name: "ExtremeTech", url: "https://www.extremetech.com/feed", category: "Hardware", enabled: true },
];

export function getEnabledFeeds() {
  return RSS_FEEDS.filter((feed) => feed.enabled !== false);
}

export function getFeedById(id) {
  if (!id) return undefined;
  return RSS_FEEDS.find((feed) => feed.id === String(id).trim().toLowerCase());
}

export function getFeedsByCategory(category) {
  return RSS_FEEDS.filter((feed) => feed.category === category && feed.enabled !== false);
}

export function getFeedStats() {
  const enabled = getEnabledFeeds();
  const byCategory = {};
  for (const feed of enabled) {
    byCategory[feed.category] = (byCategory[feed.category] ?? 0) + 1;
  }
  return {
    total: RSS_FEEDS.length,
    enabled: enabled.length,
    categories: Object.keys(byCategory).length,
    byCategory,
  };
}

export default RSS_FEEDS;
