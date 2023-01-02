import { createContext, useContext } from "react";
import { Alerts } from "./AlertNotifcations";

export const AlertContext = createContext<Alerts>(null!);

export function useAlerts() {
    return useContext(AlertContext);
}