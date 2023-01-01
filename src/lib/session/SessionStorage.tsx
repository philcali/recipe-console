import Storage, { KeyValue } from "../storage/Storage";

const SESS_CTX = 'rec_ses';
const AUTH_CTX = 'rec_acc';

export interface ClientToken {
    readonly accessToken: string;
    readonly sessionToken: string;
    readonly expiresIn: number;
    readonly redirect: string;
}

export function parseTokenFromHash(hash: string): ClientToken | undefined {
    let elements = hash.replace('#', '').split('&');
    let response: {[key: string]: string} = {};
    elements.forEach(element => {
        let parts = element.split('=');
        response[parts[0]] = parts[1];
    });
    if (response['access_token']) {
        return {
            accessToken: response['access_token'],
            sessionToken: response['id_token'],
            redirect: response['state'] || '/',
            expiresIn: parseInt(response['expires_in'])
        }
    }
    return undefined;
}

class SessionStorage {
    private readonly storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    accessToken(): KeyValue {
        return this.storage.getItem(AUTH_CTX);
    }

    sessionToken(): KeyValue {
        return this.storage.getItem(SESS_CTX);
    }

    update(clientToken: ClientToken) {
        this.storage.putItem(SESS_CTX, clientToken.sessionToken, clientToken.expiresIn);
        this.storage.putItem(AUTH_CTX, clientToken.accessToken, clientToken.expiresIn);
    }

    clear() {
        [SESS_CTX, AUTH_CTX].forEach(key => this.storage.deleteItem(key));
    }
}

export default SessionStorage;