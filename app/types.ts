export enum statusLine {
  OK = "HTTP/1.1 200 OK\r\n",
  SUCCESS = "HTTP/1.1 201 Created\r\n\r\n",
  NOT_FOUND = "HTTP/1.1 404 Not Found\r\n",
}

export type Headers = {
  "Content-Type"?: string;
  "Content-Length"?: string;
  "User-Agent"?: string;
};

export type Request = {
  status: string;
  headers: Headers;
  body: string;
  method: string;
  path: string;
  version: string;
};

export type Response = {
  status: statusLine;
  headers: Headers;
  body: string;
};

export enum Path {
  root = "/",
  echo = "/echo",
  files = "/files",
  userAgent = "/user-agent",
}
