import { eq } from "drizzle-orm";
import { db } from "../db/database.js";
import { tasks } from "../db/schema.js";

type Task = {
    title: string;
    description: string;
    status: (typeof tasks.$inferSelect)["status"];
    priority: (typeof tasks.$inferSelect)["priority"];
};

export const createTask = async (task: Task) => {
    const newTask = await db.insert(tasks).values(task).returning();
    return newTask;
};

export const getAllTasks = async () => {
    const tasks = await db.query.tasks.findMany();
    return tasks;
}

export const getTaskById = async (id: string) => {
    const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
    });
    return task;
};

export const updateTaskDetails = async (id: string, task: Pick<Task, "title" | "description" | "status" | "priority">) => {
    const [updatedTask] = await db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
    return updatedTask;
};

export const deleteTask = async (id: string) => {
    const [deletedTask] = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return deletedTask;
};
