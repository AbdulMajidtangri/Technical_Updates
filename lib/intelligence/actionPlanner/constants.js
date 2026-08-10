/** Rule-based action signal patterns — deterministic pre-filter */
export const ACTION_SIGNAL_PATTERNS = [
  { type: "vulnerability", patterns: [/vulnerabilit/i, /security flaw/i, /zero-day/i, /cve-/i, /exploit/i] },
  { type: "deadline", patterns: [/deadline/i, /by\s+\w+\s+\d/i, /before\s+\w+\s+\d/i, /ends?\s+on/i, /due\s+by/i, /expires?/i] },
  { type: "end_of_support", patterns: [/end of (life|support)/i, /end-of-life/i, /eol/i, /no longer (supported|receive)/i] },
  { type: "recall", patterns: [/recall/i, /recalled/i] },
  { type: "policy_change", patterns: [/new (law|regulation|policy|rule)/i, /policy change/i, /regulation/i] },
  { type: "service_shutdown", patterns: [/shut\s?down/i, /discontinu/i, /sunset/i, /will close/i] },
  { type: "software_update", patterns: [/update (required|available|released)/i, /patch/i, /upgrade/i] },
  { type: "travel_restriction", patterns: [/travel (ban|restriction|advisory)/i, /visa requirement/i] },
  { type: "price_change", patterns: [/price (increase|hike|change)/i, /subscription/i, /fee increase/i] },
  { type: "emergency", patterns: [/emergency/i, /urgent/i, /immediate action/i] },
  { type: "warning", patterns: [/warn/i, /alert/i, /caution/i] },
];

export const AUDIENCE_KEYWORDS = {
  Developers: [/developer/i, /software/i, /api/i, /node\.?js/i, /react/i, /python/i, /programming/i],
  Students: [/student/i, /university/i, /education/i, /exam/i],
  Travelers: [/travel/i, /flight/i, /airport/i, /visa/i, /tourist/i],
  Consumers: [/consumer/i, /customer/i, /user/i, /shoppers?/i],
  "Business owners": [/business/i, /startup/i, /enterprise/i, /company/i],
  Investors: [/investor/i, /stock/i, /market/i, /shares/i],
  "Software administrators": [/administrator/i, /sysadmin/i, /it team/i, /devops/i],
};

export default ACTION_SIGNAL_PATTERNS;
