import * as net from "net";

enum statusLine {
  OK = "HTTP/1.1 200 OK\r\n",
  NOT_FOUND = "HTTP/1.1 404 Not Found\r\n",
}

type Headers = {
  "Content-Type"?: string;
  "Content-Length"?: string;
  "User-Agent"?: string;
};

type Request = {
  status: string;
  headers: Headers;
  body: string;
  method: string;
  path: string;
  version: string;
};

type Response = {
  status: statusLine;
  headers: Headers;
  body: string;
};

enum Path {
  root = "/",
  echo = "/echo",
  userAgent = "/user-agent",
}

function parseRequest(request: Buffer): Request {
  const data = request.toString();
  const [header, body] = data.split("\r\n\r\n");
  const [status, ...headers] = header.split("\r\n");

  const constructedHeader = headers.reduce((prevProp, header) => {
    const [key, value] = header.split(": ");
    return { ...prevProp, [key]: value };
  }, {});
  const [method, path, version] = status.split(" ");

  return { status, headers: constructedHeader, body, method, path, version };
}

function constructResponse({
  status,
  headers = {},
  body = "",
}: Response): Buffer {
  const statusBuffer = Buffer.from(status);
  const headersBuffer = Buffer.from(
    Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n")
  );
  const bodyBuffer = Buffer.from(body);

  return Buffer.concat([
    statusBuffer,
    headersBuffer,
    Buffer.from("\r\n\r\n"),
    bodyBuffer,
  ]);
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const { status, headers, body, path } = parseRequest(data);
    const query = path.split("/").pop();
    let response = constructResponse({
      status: statusLine.NOT_FOUND,
      headers: {},
      body: "",
    });
    switch (path) {
      case Path.root:
        response = constructResponse({
          status: statusLine.OK,
          headers: {},
          body: "",
        });
        break;

      case `${Path.echo}/${query}`:
        const echoStr = path.split("/").pop() as string;
        const resHeaders = {
          "Content-Type": "text/plain",
          "Content-Length": echoStr.length.toString(),
        };
        response = constructResponse({
          status: statusLine.OK,
          headers: resHeaders,
          body: echoStr,
        });
        break;

      case Path.userAgent:
        const hasUserAgent = "User-Agent" in headers;
        if (hasUserAgent) {
          const userAgent = headers["User-Agent"] ? headers["User-Agent"] : "";
          const resHeaders = {
            "Content-Type": "text/plain",
            "Content-Length": userAgent?.length.toString(),
          };
          response = constructResponse({
            status: statusLine.OK,
            headers: resHeaders,
            body: userAgent,
          });
        }
        break;
    }
    socket.write(response);
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
