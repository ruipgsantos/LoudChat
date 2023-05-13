export default interface CacheService<T> {
  addMessage(userMessage: T): T;

  getLastMessage(): T;

  getAllMessages(): T[];

  clear(): void;

  applyTransformation(transform: (element: T) => T): void;
}
