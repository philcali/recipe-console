import { useContext, createContext, Context } from "react";
import { Authorizer } from "./ProvideAuth";

export const AuthContext: Context<Authorizer> = createContext<Authorizer>(null!);

export function useAuth(): Authorizer {
    return useContext(AuthContext);
}