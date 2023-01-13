import SessionStorage from '../session/SessionStorage';
import settings from '../settings.json';

const ENDPOINT = settings.apiEndpoint;

export interface TransferObject {
    readonly createTime: number;
    readonly updateTime: number;
}

export interface QueryParams {
    readonly limit?: number;
    readonly nextToken?: string;
}

export interface QueryResults<T extends TransferObject> {
    readonly items: T[];
    readonly nextToken?: string;
}


export abstract class BaseService<T extends TransferObject, I> {
    readonly endpoint: string;
    readonly sessions: SessionStorage;
    readonly resource: string;

    constructor(resource: string, sessions: SessionStorage, endpoint?: string) {
        this.endpoint = endpoint || ENDPOINT;
        this.resource = resource;
        this.sessions = sessions;
    }

    protected throwOnError(resp: Response): Response {
        if (!resp.ok) {
            throw new Error(`Response failed ${resp.status}: ${resp.text}`);
        }
        return resp;
    }

    protected async request(path: string, params?: {[key: string]: any}): Promise<Response> {
        let additionalParams = params || {};
        let headers = additionalParams.headers || {};
        return fetch(`${this.endpoint}/${path}`, {
            ...(additionalParams),
            headers: {
                ...(headers),
                "Authorization": `Bearer ${this.sessions.accessToken()}`
            }
        })
        .then(this.throwOnError);
    }

    async get(itemId: string): Promise<T> {
        const resp = await this.request([this.resource, itemId].join('/'));
        return resp.json();
    }

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

    async list(params?: QueryParams): Promise<QueryResults<T>> {
        let searchParams = [];
        let extra = '';
        if (params && params.limit) {
            searchParams.push(`limit=${params.limit}`);
        }
        if (params && params.nextToken) {
            searchParams.push(`nextToken=${params.nextToken}`);
        }
        if (searchParams.length > 0) {
            extra = `?${searchParams.join('&')}`;
        }
        const resp = await this.request(`${this.resource}${extra}`);
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

    async delete(itemId: string): Promise<string> {
        await this.request([this.resource, itemId].join('/'), {
            method: 'DELETE'
        });
        return itemId;
    }
}