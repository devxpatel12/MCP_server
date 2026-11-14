import { Client } from "@prefecthq/fastmcp-ts/client";
import { TaskStatus, TaskPriority } from "./db/schema.js";

export const client = await Client.connect('http://localhost:3000/mcp');

export const createTaskUsingMCP = async () => {
    await client.callTool('create-task', {
        title: "MCP Server in 1 hour",
        description: "Need to finish the MCP Server in 1 hour",
        status: "todo",
        priority: "medium",
    });
}

export const updateTaskDetailsUsingMCP = async (
    id: string,
    title: string,
    description: string,
    status: (typeof TaskStatus.enumValues)[number],
    priority: (typeof TaskPriority.enumValues)[number],
) => {
    await client.callTool('update-task', { id, title, description, status, priority });
}
export const getAllTasksUsingMCP = async () => {
    try {
        const result = await client.callTool('get-tasks');
        const tasks = result.structuredContent
        console.log(tasks);
    } catch (error) {
        console.log(error);
    }
}

export const getToolsFromMCPServer = async () => {
    const tools = await client.listTools();
    if (!tools) return console.log("No tools found");
    const allTools = tools.map((tool) => tool.name);
    console.log(allTools);
} 
