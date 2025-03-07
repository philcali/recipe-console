import { PropsWithChildren, useState } from "react";
import { authService } from "../../lib/services";
import { sessionStorage } from "../../lib/session";
import { ClientToken } from "../../lib/session/SessionStorage";
import { AuthContext } from "./AuthContext";

export interface User {
    readonly session?: string;
    readonly username?: string;
    readonly name?: string;
    readonly email?: string;
    readonly picture?: string;
    readonly loading: boolean;
}

export interface Authorizer {
    readonly user: User;

    isLoggedIn(): boolean;
    login(token: ClientToken): Promise<void>;
    logout(): void;
}

export function useProvideAuth(): Authorizer {
    const [ user, setUser ] = useState({
        session: sessionStorage.sessionToken(),
        loading: true
    });

    if (user.loading) {
        if (user.session) {
            authService.userInfo()
                .then(info => {
                    setUser({
                        ...user,
                        ...info,
                        loading: false
                    });
                })
                .catch(error => {
                    setUser({
                        ...user,
                        loading: false
                    })
                })
        } else {
            setUser({
                ...user,
                loading: false
            })
        }
    }

    let logout = () => {
        sessionStorage.clear();
        setUser({
            loading: false,
            session: undefined
        });
    }

    let login = async (clientToken: ClientToken) => {
        sessionStorage.update(clientToken);
        setUser({
            loading: true,
            session: sessionStorage.sessionToken()
        });
    }

    let isLoggedIn = () => {
        return !!sessionStorage.sessionToken();
    }

    return {
        user,
        login,
        isLoggedIn,
        logout
    }
}

function ProvideAuth({ children }: PropsWithChildren) {
    const auth = useProvideAuth();
    return (
        <AuthContext.Provider value={auth}>
            { children }
        </AuthContext.Provider>
    );
}

export default ProvideAuth;