import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const dailyVisitors = sqliteTable(
  "daily_visitors",
  {
    day: text("day").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    firstSeen: text("first_seen").notNull(),
    lastSeen: text("last_seen").notNull(),
    pageViews: integer("page_views").notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.day, table.visitorHash] })],
);

export const appVisits = sqliteTable(
  "app_visits",
  {
    day: text("day").notNull(),
    appSlug: text("app_slug").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    firstSeen: text("first_seen").notNull(),
    lastSeen: text("last_seen").notNull(),
    visits: integer("visits").notNull().default(1),
  },
  (table) => [primaryKey({ columns: [table.day, table.appSlug, table.visitorHash] })],
);

export const visitSessions = sqliteTable("visit_sessions", {
    sessionHash: text("session_hash").primaryKey(),
    visitorHash: text("visitor_hash").notNull(),
    day: text("day").notNull(),
    startedAt: text("started_at").notNull(),
    lastSeen: text("last_seen").notNull(),
    deviceType: text("device_type").notNull(),
    browser: text("browser").notNull(),
    operatingSystem: text("operating_system").notNull(),
    country: text("country").notNull(),
    region: text("region").notNull(),
    language: text("language").notNull().default("Unknown"),
    referrerHost: text("referrer_host").notNull(),
    campaignSource: text("campaign_source").notNull(),
    campaignMedium: text("campaign_medium").notNull(),
    campaignName: text("campaign_name").notNull(),
    campaignContent: text("campaign_content").notNull().default("None"),
    campaignTerm: text("campaign_term").notNull().default("None"),
    entryPath: text("entry_path").notNull(),
    exitPath: text("exit_path").notNull(),
    pageViews: integer("page_views").notNull().default(1),
    appLaunches: integer("app_launches").notNull().default(0),
    isReturning: integer("is_returning", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    index("visit_sessions_day_idx").on(table.day),
    index("visit_sessions_visitor_idx").on(table.visitorHash),
    index("visit_sessions_last_seen_idx").on(table.lastSeen),
  ],
);

export const eventFacts = sqliteTable("event_facts", {
    eventHash: text("event_hash").primaryKey(),
    visitorHash: text("visitor_hash").notNull(),
    sessionHash: text("session_hash").notNull(),
    day: text("day").notNull(),
    createdAt: text("created_at").notNull(),
    eventType: text("event_type").notNull(),
    label: text("label").notNull(),
    appSlug: text("app_slug").notNull(),
    path: text("path").notNull(),
    value: real("value").notNull().default(0),
  },
  (table) => [
    index("event_facts_day_type_idx").on(table.day, table.eventType),
    index("event_facts_app_idx").on(table.appSlug),
    index("event_facts_session_idx").on(table.sessionHash),
  ],
);

export const performanceSamples = sqliteTable("performance_samples", {
    sessionHash: text("session_hash").primaryKey(),
    visitorHash: text("visitor_hash").notNull(),
    day: text("day").notNull(),
    recordedAt: text("recorded_at").notNull(),
    lcpMs: real("lcp_ms").notNull().default(0),
    inpMs: real("inp_ms").notNull().default(0),
    cls: real("cls").notNull().default(0),
    loadMs: real("load_ms").notNull().default(0),
    connectionType: text("connection_type").notNull(),
    viewport: text("viewport").notNull(),
    deviceType: text("device_type").notNull(),
    country: text("country").notNull(),
  },
  (table) => [index("performance_samples_day_idx").on(table.day)],
);

export const dailyCounters = sqliteTable(
  "daily_counters",
  {
    day: text("day").notNull(),
    metric: text("metric").notNull(),
    value: integer("value").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.day, table.metric] })],
);

export const adminAccessLogs = sqliteTable("admin_access_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  day: text("day").notNull(),
  accessedAt: text("accessed_at").notNull(),
  accountHash: text("account_hash").notNull(),
  outcome: text("outcome").notNull(),
});
