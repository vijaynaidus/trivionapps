import { createServer } from "node:http";
import { Readable } from "node:stream";
import handler from "./dist/server/index.js";

const port = Number(process.env.PORT || 3000);

const server = createServer(async (request, response) => {
  try {
    const protocol = request.headers["x-forwarded-proto"] || "http";
    const host = request.headers.host || `localhost:${port}`;
    const url = `${protocol}://${host}${request.url || "/"}`;
    const headers = new Headers();

    for (const [name, value] of Object.entries(request.headers)) {
      if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(", ") : value);
    }

    const body = request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await new Promise((resolve, reject) => {
          const chunks = [];
          request.on("data", (chunk) => chunks.push(chunk));
          request.on("end", () => resolve(Buffer.concat(chunks)));
          request.on("error", reject);
        });

    const result = await handler.fetch(new Request(url, {
      method: request.method,
      headers,
      body,
    }));

    response.writeHead(result.status, Object.fromEntries(result.headers));
    if (result.body) Readable.fromWeb(result.body).pipe(response);
    else response.end();
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end("Internal Server Error");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
