import { FileStorage, MemoryStorage, Storage } from "@microsoft/agents-hosting";
import { StorageConfig } from "src/shared/interfaces";

/**
 * Factory for creating storage instances based on configuration.
 */
export function createStorage(config: StorageConfig): Storage {
  switch (config.type) {
    case "file":
      return new FileStorage(config.filePath);
    case "memory":
    default:
      return new MemoryStorage();
  }
}
