import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  referrerHost: text("referrer_host").notNull(),
  campaignSource: text("campaign_source").notNull(),
  campaignMedium: text("campaign_medium").notNull(),
  campaignName: text("campaign_name").notNull(),
  entryPath: text("entry_path").notNull(),
  exitPath: text("exit_path").notNull(),
  pageViews: integer("page_views").notNull().default(1),
  appLaunches: integer("app_launches").notNull().default(0),
  isReturning: integer("is_returning", { mode: "boolean" }).notNull().default(false),
});
