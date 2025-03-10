import { AbstractCrdt, CrdtFactory } from "../../js-lib/index.js"; // eslint-disable-line
import yorkie from "yorkie-js-sdk-lamport/packages/sdk/dist/yorkie-js-sdk.js";

export const name = "yorkie-lamport";

const docKey = "bench-lamport";
let currentID = 1;
const generateActorID = () => {
  const paddedID = currentID.toString().padStart(24, "0");
  currentID++;
  return paddedID;
};

const initialDoc = new yorkie.Document(docKey);
initialDoc.update((root) => {
  if (!root.text) {
    root.text = new yorkie.Text();
    root.array = [];
    root.map = {};
  }
});
const initialDocChangePack = initialDoc.getLocalChangePack();

/**
 * @implements {CrdtFactory}
 */
export class YorkieFactory {
  /**
   * @param {function(Uint8Array):void} updateHandler
   */
  create(updateHandler) {
    return new YorkieCRDT(updateHandler);
  }

  /**
   * @param {function(Uint8Array):void} updateHandler
   * @param {Uint8Array} bin
   * @return {AbstractCrdt}
   */
  load(updateHandler, bin) {
    const crdt = new YorkieCRDT(updateHandler);
    crdt.doc.applyChangePackFromBytes(bin);
    return crdt;
  }

  getName() {
    return name;
  }
}

/**
 * @implements {AbstractCrdt}
 */
export class YorkieCRDT {
  /**
   * @param {function(Uint8Array):void} updateHandler
   */
  constructor(updateHandler) {
    this.doc = new yorkie.Document(docKey, {
      disableGC: true,
    });
    const newActorID = generateActorID();
    this.doc.setActor(newActorID);
    this.doc.applyChangePackFromBytes(initialDocChangePack);
    this.doc.subscribe(() => {
      updateHandler(this.doc.getLocalChangePack());
    });
  }

  /**
   * @return {Uint8Array|string}
   */
  getEncodedState() {
    return this.doc.getSnapshotPack();
  }

  /**
   * @param {Uint8Array} update
   */
  applyUpdate(update) {
    this.doc.applyChangePackFromBytes(update);
  }

  /**
   * Insert several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {Array<any>} elems
   */
  insertArray(index, elems) {
    this.doc.update((root) => {
      root.array.splice(index, 0, ...elems);
    });
  }

  /**
   * Delete several items into the internal shared array implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteArray(index, len) {
    this.doc.update((root) => {
      root.array.splice(index, len);
    });
  }

  /**
   * @return {Array<any>}
   */
  getArray() {
    return this.doc.getRoot().array.toJS();
  }

  /**
   * Insert text into the internal shared text implementation.
   *
   * @param {number} index
   * @param {string} text
   */
  insertText(index, text) {
    this.doc.update((root) => {
      root.text.edit(index, index, text);
    });
  }

  /**
   * Delete text from the internal shared text implementation.
   *
   * @param {number} index
   * @param {number} len
   */
  deleteText(index, len) {
    this.doc.update((root) => {
      root.text.edit(index, index + len, "");
    });
  }

  /**
   * @return {string}
   */
  getText() {
    return this.doc.getRoot().text.toString();
  }

  /**
   * @param {function (AbstractCrdt): void} f
   */
  transact(f) {
    // TODO(chacha912): implement transact
    f(this);
  }

  /**
   * @param {string} key
   * @param {any} val
   */
  setMap(key, val) {
    this.doc.update((root) => {
      root.map[key] = val;
    });
  }

  /**
   * @return {Map<string,any> | Object<string, any>}
   */
  getMap() {
    return this.doc.getRoot().map.toJS();
  }
}
