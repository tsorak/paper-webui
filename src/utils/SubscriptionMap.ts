type SubscriptionEvent = "set" | "delete" | "reset";

type ModifiedData<K, V> = [key: K, value: V] | [key: K, value: V][];

/**
 * A Map which emits events when it is modified.
 */
class SubscriptionMap<K, V> {
  #valuesMap: Map<K, V>;
  #subscribers: Map<
    SubscriptionEvent,
    Set<(modifiedEntry: ModifiedData<K, V>) => void>
  >;

  constructor() {
    this.#valuesMap = new Map<K, V>();

    this.#subscribers = new Map<
      SubscriptionEvent,
      Set<(modifiedEntry: ModifiedData<K, V>) => void>
    >();
    this.#subscribers.set("set", new Set());
    this.#subscribers.set("delete", new Set());
    this.#subscribers.set("reset", new Set());
  }

  private _emit(event: "set", modifiedEntry: [K, V]): void;
  private _emit(event: "delete", modifiedEntry: [K, V]): void;
  private _emit(event: "reset", modifiedEntry: [K, V][]): void;
  private _emit(event: SubscriptionEvent, modifiedEntry: ModifiedData<K, V>) {
    this.#subscribers.get(event)?.forEach((fn) => fn(modifiedEntry));
  }

  public subscribe(event: "set", fn: (modifiedEntry: [K, V]) => void): void;
  public subscribe(event: "delete", fn: (modifiedEntry: [K, V]) => void): void;
  public subscribe(event: "reset", fn: (modifiedEntry: [K, V][]) => void): void;
  public subscribe(event: SubscriptionEvent, fn: (modifiedEntry: any) => void) {
    // if (Array.isArray(event)) {
    //   event.forEach((e) => this.subscribe(e, fn));
    //   return;
    // }

    this.#subscribers.get(event)!.add(fn);
  }

  public unsubscribe(
    event: SubscriptionEvent | SubscriptionEvent[],
    fn: (modifiedEntry: ModifiedData<K, V>) => void
  ) {
    if (Array.isArray(event)) {
      event.forEach((e) => this.unsubscribe(e, fn));
      return;
    }

    this.#subscribers.get(event)!.delete(fn);
  }

  public _reset(initialData: [K, V][]) {
    this.#valuesMap = new Map(initialData);
    this._emit("reset", initialData);
  }

  public get(key: K) {
    return this.#valuesMap.get(key);
  }

  public set(key: K, value: V) {
    this.#valuesMap.set(key, value);
    this._emit("set", [key, value]);
    return this.#valuesMap;
  }

  public update(key: K, updater: (value: V) => V) {
    const oldValue = this.#valuesMap.get(key);
    const newValue = updater(oldValue!);
    this.#valuesMap.set(key, newValue);
    this._emit("set", [key, newValue]);
  }

  public delete(key: K) {
    const deleted = this.#valuesMap.delete(key);
    if (deleted) this._emit("delete", [key, null as V]);
    return deleted;
  }

  public has(key: K) {
    return this.#valuesMap.has(key);
  }

  public values() {
    return this.#valuesMap.values();
  }
}

export default SubscriptionMap;
