
export type KeyValue = string | undefined;

export default interface Storage {
    getItem(key: string, defaultValue?: string): KeyValue;

    putItem(key: string, value: string, expiresIn?: number): void;

    deleteItem(key: string): void;
}