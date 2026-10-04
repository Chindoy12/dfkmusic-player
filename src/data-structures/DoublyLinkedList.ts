import { SongNode } from './SongNode';

export class DoublyLinkedList<T> implements Iterable<T> {
  private head: SongNode<T> | null = null;
  private tail: SongNode<T> | null = null;
  private size = 0;

  getHead(): SongNode<T> | null {
    return this.head;
  }

  getTail(): SongNode<T> | null {
    return this.tail;
  }

  getSize(): number {
    return this.size;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  addFirst(value: T): SongNode<T> {
    const node = new SongNode(value);
    if (this.head) {
      node.next = this.head;
      this.head.previous = node;
    } else {
      this.tail = node;
    }
    this.head = node;
    this.size++;
    return node;
  }

  addLast(value: T): SongNode<T> {
    const node = new SongNode(value);
    if (this.tail) {
      node.previous = this.tail;
      this.tail.next = node;
    } else {
      this.head = node;
    }
    this.tail = node;
    this.size++;
    return node;
  }

  insertAt(index: number, value: T): SongNode<T> {
    if (index < 0 || index > this.size) {
      throw new RangeError('INDEX_OUT_OF_RANGE');
    }
    if (index === 0) return this.addFirst(value);
    if (index === this.size) return this.addLast(value);

    const following = this.getNode(index) as SongNode<T>;
    const preceding = following.previous as SongNode<T>;
    const node = new SongNode(value);
    node.previous = preceding;
    node.next = following;
    preceding.next = node;
    following.previous = node;
    this.size++;
    return node;
  }

  getNode(index: number): SongNode<T> | null {
    if (index < 0 || index >= this.size) return null;

    if (index < this.size / 2) {
      let node = this.head;
      for (let i = 0; i < index; i++) node = node!.next;
      return node;
    }
    let node = this.tail;
    for (let i = this.size - 1; i > index; i--) node = node!.previous;
    return node;
  }

  get(index: number): T | null {
    return this.getNode(index)?.value ?? null;
  }

  find(predicate: (value: T) => boolean): SongNode<T> | null {
    for (const node of this.nodes()) {
      if (predicate(node.value)) return node;
    }
    return null;
  }

  next(node: SongNode<T>): SongNode<T> | null {
    return node.next;
  }

  previous(node: SongNode<T>): SongNode<T> | null {
    return node.previous;
  }

  remove(value: T): boolean {
    const node = this.find((candidate) => candidate === value);
    if (!node) return false;
    this.unlink(node);
    return true;
  }

  removeAt(index: number): T | null {
    const node = this.getNode(index);
    if (!node) return null;
    this.unlink(node);
    return node.value;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  sortAlphabetically(getKey: (value: T) => string, descending = false): void {
    const direction = descending ? -1 : 1;
    this.sort((a, b) => direction * getKey(a).localeCompare(getKey(b), 'es', { sensitivity: 'base' }));
  }

  sort(compare: (a: T, b: T) => number): void {
    this.head = this.mergeSort(this.head, compare);
    this.relink();
  }

  *nodes(): Generator<SongNode<T>> {
    for (let node = this.head; node; node = node.next) yield node;
  }

  *nodesBackward(): Generator<SongNode<T>> {
    for (let node = this.tail; node; node = node.previous) yield node;
  }

  [Symbol.iterator](): Iterator<T> {
    return (function* (list: DoublyLinkedList<T>) {
      for (const node of list.nodes()) yield node.value;
    })(this);
  }

  toArray(): T[] {
    return [...this];
  }

  toReversedArray(): T[] {
    return Array.from(this.nodesBackward(), (node) => node.value);
  }

  private unlink(node: SongNode<T>): void {
    if (node.previous) node.previous.next = node.next;
    else this.head = node.next;

    if (node.next) node.next.previous = node.previous;
    else this.tail = node.previous;

    node.previous = null;
    node.next = null;
    this.size--;
  }

  private mergeSort(head: SongNode<T> | null, compare: (a: T, b: T) => number): SongNode<T> | null {
    if (!head || !head.next) return head;

    const secondHalf = this.splitAtMiddle(head);
    return this.merge(this.mergeSort(head, compare), this.mergeSort(secondHalf, compare), compare);
  }

  private splitAtMiddle(head: SongNode<T>): SongNode<T> | null {
    let slow = head;
    let fast = head.next;
    while (fast && fast.next) {
      slow = slow.next as SongNode<T>;
      fast = fast.next.next;
    }
    const secondHalf = slow.next;
    slow.next = null;
    return secondHalf;
  }

  private merge(
    left: SongNode<T> | null,
    right: SongNode<T> | null,
    compare: (a: T, b: T) => number,
  ): SongNode<T> | null {
    const sentinel = new SongNode<T>(undefined as T);
    let tail = sentinel;

    while (left && right) {
      if (compare(left.value, right.value) <= 0) {
        tail.next = left;
        tail = left;
        left = left.next;
      } else {
        tail.next = right;
        tail = right;
        right = right.next;
      }
    }
    tail.next = left ?? right;
    return sentinel.next;
  }

  private relink(): void {
    let previous: SongNode<T> | null = null;
    for (let node = this.head; node; node = node.next) {
      node.previous = previous;
      previous = node;
    }
    this.tail = previous;
  }
}
