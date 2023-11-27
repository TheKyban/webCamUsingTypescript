let version = 2;
const openRequest = indexedDB.open("myDB", version);
let db: IDBDatabase | null = null;

openRequest.onsuccess = (e) => {
    db = openRequest.result;
};

openRequest.onerror = (e) => {};

openRequest.onupgradeneeded = (e: IDBVersionChangeEvent) => {
    db = openRequest.result;

    // Object Creation
    db.createObjectStore("video", { keyPath: "id" });
    db.createObjectStore("image", { keyPath: "id" });
};

export { db, openRequest };
