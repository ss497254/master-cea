export interface CommandRequest {
  command: string;
  args: string[]; // positional args
  namedArgs: Record<string, string>; // named args (--key=value)
  raw: string; // original message
}
