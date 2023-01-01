import Storage, { KeyValue } from "./Storage";

interface LocalStorageEntry {
    readonly value: string;
    readonly expiration?: number;
}

class LocalStorage implements Storage {
    getItem(key: string, defaultValue?: string): KeyValue {
        let value = undefined;
        let entry = localStorage.getItem(key);
        if (entry !== null) {
            let parsedEntry: LocalStorageEntry = JSON.parse(entry);
            if (parsedEntry.expiration && parsedEntry.expiration <= Date.now()) {
                this.deleteItem(key);
            } else {
                value = parsedEntry.value;
            }
        }
        return value || defaultValue;
    }

    putItem(key: string, value: string, expiresIn?: number): void {
        let entry: LocalStorageEntry = { value };
        if (expiresIn !== undefined) {
            entry = {
                ...entry,
                expiration: Date.now() + (expiresIn * 1000)
            };
        }
        localStorage.setItem(key, JSON.stringify(entry));
    }

    deleteItem(key: string): void {
        localStorage.removeItem(key);
    }
}

export default LocalStorage;