import SessionStorage from "../session/SessionStorage";
import settings from "../settings.json";

const ENDPOINT = settings.apiEndpoint;

export interface Ingredient {
    readonly name: string;
    readonly measurement: string;
    readonly amount: number;
}

export interface QueryParams {
    readonly limit?: number;
    readonly nextToken?: string;
}

export interface QueryResults<T> {
    readonly items: T[];
    readonly nextToken?: string;
}

export interface Recipe {
    readonly recipeId: string;
    readonly name: string;
    readonly instructions: string;
    readonly ingredients: Ingredient[];
    readonly prepareTimeMinutes?: number;
    readonly createTime: number;
    readonly updateTime: number;
}

export interface RecipeUpdate {
    readonly name?: string;
    readonly instructions?: string;
    readonly ingredients?: Ingredient[];
    readonly prepareTimeMinutes?: number;
}

class RecipeService {
    readonly endpoint: string;
    readonly sessions: SessionStorage;

    constructor(sessions: SessionStorage) {
        this.endpoint = ENDPOINT;
        this.sessions = sessions;
    }

    private async request(path: string, params?: {[key: string]: any}): Promise<Response> {
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

    private throwOnError(resp: Response): Response {
        if (!resp.ok) {
            throw new Error(`Response failed ${resp.status}: ${resp.text}`);
        }
        return resp;
    }

    async get(recipeId: string): Promise<Recipe> {
        const resp = await this.request(['recipes', recipeId].join('/'));
        return resp.json();
    }

    async create(update: RecipeUpdate): Promise<Recipe> {
        const resp = await this.request('recipes', {
            method: 'POST',
            body: JSON.stringify(update),
            headers: {
                "Content-Type": 'application/json'
            }
        });
        return resp.json();
    }

    async update(recipeId: string, update: RecipeUpdate): Promise<Recipe> {
        const resp = await this.request(['recipes', recipeId].join('/'), {
            method: 'PUT',
            body: JSON.stringify(update),
            headers: {
                "Content-Type": 'application/json'
            }
        });
        return resp.json();
    }

    async delete(recipeId: string): Promise<string> {
        await this.request(['recipes', recipeId].join('/'), {
            method: 'DELETE'
        });
        return recipeId;
    }

    async list(params?: QueryParams): Promise<QueryResults<Recipe>> {
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
        const resp = await this.request(`recipes${extra}`);
        return resp.json();
    }
}

export default RecipeService;