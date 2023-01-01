import SessionStorage from "../session/SessionStorage";
import settings from "../settings.json";

const CLIENT_ID = settings.clientId;
const ENDPOINT = settings.authEndpoint;

export default class AuthService {
    private readonly sessions: SessionStorage;
    private readonly endpoint: string;

    constructor(sessions: SessionStorage) {
        this.endpoint = ENDPOINT;
        this.sessions = sessions;
    }

    userInfo(): Promise<any> {
        return fetch(`${this.endpoint}/oauth2/userInfo`, {
            headers: {
                'Authorization': `Bearer ${this.sessions.accessToken()}`
            }
        }).then(resp => resp.json());
    }

    loginEndpoint(currentHost: string, from?: string): string {
        let params = [
            'response_type=token',
            `client_id=${CLIENT_ID}`,
            `redirect_uri=${currentHost}/login`
        ];
        if (from !== undefined) {
            params.push(`state=${from}`);
        }
        return `${this.endpoint}/oauth2/authorize?${params.join('&')}`;
    }

    logoutEndpoint(currentHost: string) {
        let params = [
            `client_id=${CLIENT_ID}`,
            `logout_uri=${currentHost}/logout`
        ];
        return `${this.endpoint}/logout?${params.join('&')}`;
    }
} 