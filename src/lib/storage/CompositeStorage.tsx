import Storage, { KeyValue } from "./Storage";

class CompositeStorage implements Storage {
    private readonly storages: Storage[];

    constructor(...storages: Storage[]) {
        this.storages = storages;
    }

    getItem(key: string, defaultValue?: string): KeyValue {
        let value = undefined;
        for (let index = 0; index < this.storages.length; index++) {
            let storage = this.storages[index];
            value = storage.getItem(key);
            if (value) {
                break;
            }
        }
        return value || defaultValue;
    }

    putItem(key: string, value: string, expiresIn?: number): void {
        this.storages.forEach(storage => storage.putItem(key, value, expiresIn));
    }

    deleteItem(key: string): void {
        this.storages.forEach(storage => storage.deleteItem(key));
    }
}

export default CompositeStorage;