export default interface CacheService<T> {
  startup(): Promise<void>;
  shutdown(): Promise<void>;

  addMessage(userMessage: T): Promise<T>;

  getAllMessages(): Promise<T[]>;

  clear(): void;

  applyTransformation(transform: (element: T) => T): Promise<void>;
}
