import Storage, { KeyValue } from './Storage';

class CookieStorage implements Storage {
    getItem(key: string, defaultValue?: string): KeyValue {
        let value = undefined;
        let cookies = document.cookie.split(/;\s*/);
        for (let index = 0; index < cookies.length; index++) {
            let parts = cookies[index].split('=');
            if (parts[0] === key) {
                value = parts.slice(1).join('=');
                break;
            }
        }
        return value || defaultValue;
    }

    putItem(key: string, value: string, expiresIn?: number): void {
        let cookieValues = [`${key}=${value}`];
        if (expiresIn !== undefined) {
            let now = Date.now();
            let expires = new Date(now + (expiresIn * 1000));
            cookieValues.push(`expires=${expires.toUTCString()}`);
        }
        document.cookie = cookieValues.join('; ');
    }

    deleteItem(key: string): void {
        this.putItem(key, '', 0);        
    }
}

export default CookieStorage;