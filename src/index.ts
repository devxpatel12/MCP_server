import { client, createTaskUsingMCP, getAllTasksUsingMCP, getToolsFromMCPServer, } from "./client.js";

export const main = async () => {
    // await getToolsFromMCPServer();
    // await createTaskUsingMCP(); 
    await getAllTasksUsingMCP();
    await client.close();
};

main();