import { FastMCP } from "@prefecthq/fastmcp-ts/server";
import { z } from 'zod';
import { createTask, deleteTask, getAllTasks, updateTaskDetails } from "./services/task.js";

const mcp = new FastMCP({ name: "task-manager", version: "1.0.0" });


// Create a new task
mcp.tool({
    name: "create-task",
    description: "Create a new task",
    input: z.object({
        title: z.string().describe("The title of the task"),
        description: z.string().describe("The description of the task"),
        status: z.enum(["todo", "in_progress", "completed"]).describe("The status of the task"),
        priority: z.enum(["low", "medium", "high"]).describe("The priority of the task"),
    }),
}, async ({ title, description, status, priority }) => {
    const newTask = await createTask({ title, description, status, priority });
    return { message: "Task created successfully", task: newTask };
});

// Get all tasks
mcp.tool({
    name: "get-tasks",
    description: "Get all tasks",
}, async () => {
    const tasks = await getAllTasks();
    return { message: "Tasks fetched successfully", tasks };
});

// Delete a task
mcp.tool({
    name: "delete-task",
    description: "Delete a task",
    input: z.object({
        id: z.string().describe("The id of the task"),
    }),
}, async ({ id }) => {
    const deletedTask = await deleteTask(id);
    return { message: "Task deleted successfully", task: deletedTask };
});

// Update a task
mcp.tool({
    name: "update-task",
    description: "Update a task",
    input: z.object({
        id: z.string().describe("The id of the task"),
        title: z.string().describe("The title of the task"),
        description: z.string().describe("The description of the task"),
        status: z.enum(["todo", "in_progress", "completed"]).describe("The status of the task"),
        priority: z.enum(["low", "medium", "high"]).describe("The priority of the task"),
    }),
}, async ({ id, title, description, status, priority }) => {
    const updatedTask = await updateTaskDetails(id, { title, description, status, priority });
    return { message: "Task updated successfully", task: updatedTask };
});
 

// Start the server
 await mcp.run();
