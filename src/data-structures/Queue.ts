import { SinglyLinkedList } from './SinglyLinkedList';

export class Queue<T> {
  private readonly items = new SinglyLinkedList<T>();

  enqueue(item: T): void {
    this.items.addLast(item);
  }

  dequeue(): T | null {
    return this.items.removeFirst();
  }

  peek(): T | null {
    return this.items.peekFirst();
  }

  remove(item: T): boolean {
    return this.items.remove(item);
  }

  getSize(): number {
    return this.items.getSize();
  }

  isEmpty(): boolean {
    return this.items.isEmpty();
  }

  clear(): void {
    this.items.clear();
  }

  toArray(): T[] {
    return this.items.toArray();
  }
}
