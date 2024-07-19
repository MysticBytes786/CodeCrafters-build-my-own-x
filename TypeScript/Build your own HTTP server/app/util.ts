import fs from "fs";
import { Headers, Request, Response } from "./types";

export function parseRequest(request: Buffer): Request {
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

export function constructResponse({
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

type fileResult =
  | {
      fileContent: string;
      fileSize: string;
    }
  | undefined;

export function handleReadFile(fileName: string, path: string): fileResult {
  try {
    let file = fs.readFileSync(path.concat(`/${fileName}`));
    const content = file.toString();
    return { fileContent: content, fileSize: file.byteLength.toString() };
  } catch (error) {
    return undefined;
  }
}

export function handleCreateFile(fileName: string, path: string, data: string) {
  fs.writeFileSync(path.concat(`/${fileName}`), data);
}

export function parseEncodingHeader(encodingHeader: Headers): Headers | {} {
  if (encodingHeader["Content-Encoding"]?.includes("gzip")) {
    const gzipEncoding = encodingHeader["Content-Encoding"]
      .split(", ")
      .filter((encodingType) => encodingType === "gzip")
      .pop();
    return { "Content-Encoding": gzipEncoding };
  }

  return {};
}
