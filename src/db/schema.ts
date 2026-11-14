import { pgTable, text, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const TaskStatus = pgEnum("task_status", ["todo", "in_progress", "completed"]);
export const TaskPriority = pgEnum("task_priority", ["low", "medium", "high"]);

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: TaskStatus("status").notNull().default("todo"),
  priority: TaskPriority("priority").notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
