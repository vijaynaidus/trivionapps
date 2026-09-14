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
