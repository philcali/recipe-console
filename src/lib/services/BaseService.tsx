import { ReadOnlyService, TransferObject } from './ReadOnlyService';

export abstract class BaseService<T extends TransferObject, I> extends ReadOnlyService<T> {

    async create(update: I): Promise<T> {
        const resp = await this.request(this.resource, {
            method: 'POST',
            body: JSON.stringify(update),
            headers: {
                "Content-Type": 'application/json'
            }
        });
        return resp.json();
    }

    async update(itemId: string, update: I): Promise<T> {
        const resp = await this.request([this.resource, itemId].join('/'), {
            method: 'PUT',
            body: JSON.stringify(update),
            headers: {
                "Content-Type": 'application/json'
            }
        });
        return resp.json();
    }
}