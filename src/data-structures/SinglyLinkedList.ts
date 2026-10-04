class SinglyNode<T> {
  next: SinglyNode<T> | null = null;

  constructor(readonly value: T) {}
}

export class SinglyLinkedList<T> implements Iterable<T> {
  private head: SinglyNode<T> | null = null;
  private tail: SinglyNode<T> | null = null;
  private size = 0;

  getSize(): number {
    return this.size;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  addFirst(value: T): void {
    const node = new SinglyNode(value);
    node.next = this.head;
    this.head = node;
    if (!this.tail) this.tail = node;
    this.size++;
  }

  addLast(value: T): void {
    const node = new SinglyNode(value);
    if (this.tail) this.tail.next = node;
    else this.head = node;
    this.tail = node;
    this.size++;
  }

  removeFirst(): T | null {
    if (!this.head) return null;
    const { value } = this.head;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return value;
  }

  remove(value: T): boolean {
    let previous: SinglyNode<T> | null = null;
    for (let node = this.head; node; node = node.next) {
      if (node.value === value) {
        if (previous) previous.next = node.next;
        else this.head = node.next;
        if (node === this.tail) this.tail = previous;
        this.size--;
        return true;
      }
      previous = node;
    }
    return false;
  }

  contains(value: T): boolean {
    return this.toArray().includes(value);
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  peekFirst(): T | null {
    return this.head?.value ?? null;
  }

  toArray(): T[] {
    return [...this];
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let node = this.head; node; node = node.next) yield node.value;
  }
}
