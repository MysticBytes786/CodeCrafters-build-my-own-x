import * as net from "net";
import { argv } from "process";
import { statusLine, Path } from "./types";
import { constructResponse, handleReadFile, parseRequest } from "./util";

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

      case `${Path.files}/${query}`:
        const fileName = path.split("/").pop() as string;
        const flag = argv[2];
        const directory = argv[3];
        const { fileContent, fileSize } = handleReadFile(fileName, directory);

        const resHeader = {
          "Content-Type": "application/octet-stream",
          "Content-Length": fileSize,
        };
        response = constructResponse({
          status: statusLine.OK,
          headers: resHeader,
          body: fileContent,
        });
    }
    socket.write(response);
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
