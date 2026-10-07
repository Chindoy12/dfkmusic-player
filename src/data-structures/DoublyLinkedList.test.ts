import { describe, expect, it } from 'vitest';
import { DoublyLinkedList } from './DoublyLinkedList';
import { Queue } from './Queue';
import { SinglyLinkedList } from './SinglyLinkedList';
import { Stack } from './Stack';

function buildList(...values: string[]): DoublyLinkedList<string> {
  const list = new DoublyLinkedList<string>();
  values.forEach((value) => list.addLast(value));
  return list;
}

describe('DoublyLinkedList', () => {
  it('adds at the start and at the end keeping head and tail', () => {
    const list = buildList('b');
    list.addFirst('a');
    list.addLast('c');
    expect(list.toArray()).toEqual(['a', 'b', 'c']);
    expect(list.getHead()?.value).toBe('a');
    expect(list.getTail()?.value).toBe('c');
    expect(list.getSize()).toBe(3);
  });

  it('inserts at any position and links both directions', () => {
    const list = buildList('a', 'c');
    list.insertAt(1, 'b');
    expect(list.toArray()).toEqual(['a', 'b', 'c']);
    expect(list.toReversedArray()).toEqual(['c', 'b', 'a']);
    expect(() => list.insertAt(9, 'x')).toThrow(RangeError);
  });

  it('removes by value and by index', () => {
    const list = buildList('a', 'b', 'c', 'd');
    expect(list.remove('a')).toBe(true);
    expect(list.removeAt(2)).toBe('d');
    expect(list.toArray()).toEqual(['b', 'c']);
    expect(list.getTail()?.value).toBe('c');
    expect(list.removeAt(5)).toBeNull();
  });

  it('navigates with node.next and node.previous', () => {
    const list = buildList('a', 'b', 'c');
    const middle = list.find((value) => value === 'b')!;
    expect(list.next(middle)?.value).toBe('c');
    expect(list.previous(middle)?.value).toBe('a');
    expect(list.previous(list.getHead()!)).toBeNull();
  });

  it('sorts alphabetically in both directions and rebuilds links', () => {
    const list = buildList('delta', 'Alpha', 'charlie', 'Bravo');
    list.sortAlphabetically((value) => value);
    expect(list.toArray()).toEqual(['Alpha', 'Bravo', 'charlie', 'delta']);
    expect(list.toReversedArray()).toEqual(['delta', 'charlie', 'Bravo', 'Alpha']);
    list.sortAlphabetically((value) => value, true);
    expect(list.toArray()).toEqual(['delta', 'charlie', 'Bravo', 'Alpha']);
    expect(list.getTail()?.value).toBe('Alpha');
  });

  it('clears and reports emptiness', () => {
    const list = buildList('a');
    list.clear();
    expect(list.isEmpty()).toBe(true);
    expect(list.getHead()).toBeNull();
  });
});

describe('Stack, Queue and SinglyLinkedList', () => {
  it('stack is LIFO', () => {
    const stack = new Stack<number>();
    stack.push(1);
    stack.push(2);
    expect(stack.toArray()).toEqual([2, 1]);
    expect(stack.pop()).toBe(2);
    expect(stack.peek()).toBe(1);
  });

  it('queue is FIFO', () => {
    const queue = new Queue<string>();
    queue.enqueue('a');
    queue.enqueue('b');
    expect(queue.dequeue()).toBe('a');
    expect(queue.remove('b')).toBe(true);
    expect(queue.dequeue()).toBeNull();
  });

  it('singly linked list adds at the start and removes any value', () => {
    const list = new SinglyLinkedList<string>();
    list.addFirst('b');
    list.addFirst('a');
    list.addLast('c');
    expect(list.remove('b')).toBe(true);
    expect(list.toArray()).toEqual(['a', 'c']);
  });
});

describe('DoublyLinkedList.moveNode', () => {
  const move = (values: string[], from: number, to: number) => {
    const list = buildList(...values);
    expect(list.moveNode(list.getNode(from)!, to)).toBe(true);
    return list;
  };

  it('moves a node from position 4 to the first position', () => {
    const list = move(['a', 'b', 'c', 'd', 'e'], 3, 0);
    expect(list.toArray()).toEqual(['d', 'a', 'b', 'c', 'e']);
    expect(list.toReversedArray()).toEqual(['e', 'c', 'b', 'a', 'd']);
    expect(list.getHead()?.value).toBe('d');
  });

  it('moves forward, to the middle and to the end keeping both directions consistent', () => {
    expect(move(['a', 'b', 'c', 'd', 'e'], 1, 3).toArray()).toEqual(['a', 'c', 'd', 'b', 'e']);
    const toEnd = move(['a', 'b', 'c'], 0, 2);
    expect(toEnd.toArray()).toEqual(['b', 'c', 'a']);
    expect(toEnd.toReversedArray()).toEqual(['a', 'c', 'b']);
    expect(toEnd.getTail()?.value).toBe('a');
    expect(toEnd.getSize()).toBe(3);
  });

  it('keeps node identity and validates the range', () => {
    const list = buildList('a', 'b', 'c');
    const node = list.getNode(2)!;
    list.moveNode(node, 0);
    expect(list.getHead()).toBe(node);
    expect(() => list.moveNode(node, 3)).toThrow(RangeError);
    expect(list.moveNode(node, 0)).toBe(true);
  });
});
