import Observer from "./observer.interface";

export default interface Observable {
  subscribe(observer: Observer): void;
}
