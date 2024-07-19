import fs from "fs";
import { fileResult, Headers, Request, Response } from "./types";
import { gzipSync } from "zlib";

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

  let bodyBuffer = Buffer.from(body);
  if (body && headers["Content-Encoding"] === "gzip") {
    bodyBuffer = compressData(bodyBuffer);
    headers["Content-Length"] = bodyBuffer.length.toString();
  }

  const headersBuffer = Buffer.from(
    Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n")
  );

  return Buffer.concat([
    statusBuffer,
    headersBuffer,
    Buffer.from("\r\n\r\n"),
    bodyBuffer,
  ]);
}

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

export function compressData(data: Buffer): Buffer {
  return gzipSync(data);
}
