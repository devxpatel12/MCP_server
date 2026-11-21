import "dotenv/config";
import { MemorySaver } from "@langchain/langgraph";
import { MCPAdapter } from "@langchain/mcp-adapters";
import { HumanMessage, createAgent } from "langchain";
import { randomUUID } from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// OpenAI rejects a tool unless every object schema sets additionalProperties to false.
function closeObjectSchemas(schema: unknown): void {
    if (!schema || typeof schema !== "object") return;
    if (Array.isArray(schema)) {
        schema.forEach(closeObjectSchemas);
        return;
    }
    const record = schema as Record<string, unknown>;
    if (record.type === "object") {
        record.properties ??= {};
        record.additionalProperties = false;
    }
    Object.values(record).forEach(closeObjectSchemas);
}

const adapter = new MCPAdapter({
    servers: {
        tasks: {
            url: "http://127.0.0.1:3000/mcp",
            transport: "http"
        }
    },
});
const prompt = readline.createInterface({ input, output });
// const tools = await adapter.listTools();
// const schema = tools.map((tool) => tool.schema);
// console.log("before: ", schema);
try {
    const tools = await adapter.listTools();
    tools.forEach((tool) => closeObjectSchemas(tool.schema));
    // console.log("after: ", tools.map((tool) => tool.schema));

    const agent = createAgent({
        model: "gpt-4o-mini",
        tools,
        systemPrompt: "you are a helpful task management assistant",
        checkpointer: new MemorySaver(),
    });
    const config = { configurable: { thread_id: randomUUID() } };

    let question = "can you please help me";
    while (question !== "q") {
        const result = await agent.invoke({ messages: [new HumanMessage(question)] }, config);
        const messages = result.messages as { text: string }[];
        console.log(messages.at(-1)?.text);
        question = (await prompt.question("please ask your question or type q to exit:\n")).trim();
    }
} finally {
    prompt.close();
    await adapter.close();
}

