import * as net from "net";
import { argv } from "process";
import { statusLine, Path } from "./types";
import {
  constructResponse,
  handleCreateFile,
  handleReadFile,
  parseEncodingHeader,
  parseRequest,
} from "./util";

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const { status, headers, body, method, path } = parseRequest(data);
    const query = path.split("/").pop();

    

    const contentEncoding = parseEncodingHeader({ "Content-Encoding": headers["Accept-Encoding"] });

    let response = constructResponse({
      status: statusLine.NOT_FOUND,
      headers: contentEncoding,
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
        const resHeader = {
          "Content-Type": "text/plain",
          "Content-Length": echoStr.length.toString(),
          ...contentEncoding,
        };
        response = constructResponse({
          status: statusLine.OK,
          headers: resHeader,
          body: echoStr,
        });
        break;

      case Path.userAgent:
        const hasUserAgent = "User-Agent" in headers;
        if (hasUserAgent) {
          const userAgent = headers["User-Agent"] ? headers["User-Agent"] : "";
          const resHeader = {
            "Content-Type": "text/plain",
            "Content-Length": userAgent?.length.toString(),
            ...contentEncoding,
          };
          response = constructResponse({
            status: statusLine.OK,
            headers: resHeader,
            body: userAgent,
          });
        }
        break;

      case `${Path.files}/${query}`:
        const fileName = path.split("/").pop() as string;
        const directory = argv[3];
        if (method === "GET") {
          const file = handleReadFile(fileName, directory);
          if (!file) {
            response = constructResponse({
              status: statusLine.NOT_FOUND,
              headers: {},
              body: "",
            });
            break;
          }
          const resHeader = {
            "Content-Type": "application/octet-stream",
            "Content-Length": file.fileSize,
            ...contentEncoding,
          };
          response = constructResponse({
            status: statusLine.OK,
            headers: resHeader,
            body: file.fileContent,
          });
        }

        //post
        if (method === "POST") {
          const content = data.toString().split("\r\n").pop() as string;
          handleCreateFile(fileName, directory, content);
          response = constructResponse({
            status: statusLine.SUCCESS,
            headers: {},
            body: "",
          });
        }
    }
    socket.write(response);
  });

  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
