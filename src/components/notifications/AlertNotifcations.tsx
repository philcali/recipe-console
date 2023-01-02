import { PropsWithChildren, useState } from "react";
import { AlertContext } from "./AlertContext";

const TIMEOUT = 5000;

interface AlertUpdate {
    readonly icon: string,
    readonly message: string,
    readonly variant: string,
    readonly timeout?: number;
}

interface Alert extends AlertUpdate {
    readonly timeout: number,
    readonly timestamp: number,
}

export interface Alerts {
    readonly alerts: Alert[],
    
    success(message: string): void;
    error(message: string): void;
    notify(alert: AlertUpdate): void;
    close(alert: Alert): void;
    sweep(): NodeJS.Timeout | undefined;
}

function useProviderAlerts(): Alerts {
    const [ alerts, setAlerts ] = useState([] as Alert[]);

    const notify = (alert: AlertUpdate) => {
        let timestamp = Date.now();
        let newAlert = {
            ...alert,
            timestamp,
            timeout: timestamp + (alert.timeout || TIMEOUT)
        };
        setAlerts([
            ...alerts, {
                ...newAlert
            }
        ]);
    };

    const success = (message: string) => {
        notify({
            icon: 'check-circle',
            variant: 'success',
            message,
        });
    };

    const error = (message: string) => {
        notify({
            icon: 'exclamation-circle',
            variant: 'danger',
            message
        });
    }

    const close = (alert: Alert) => {
        setAlerts(alerts.filter(a => a !== alert));
    }

    const sweep = () => {
        let alert = alerts[0];
        if (alert) {
            let now = Date.now();
            return setTimeout(() => close(alert), alert.timeout - now);
        }
        return undefined;
    }

    return {
        alerts,
        notify,
        success,
        error,
        close,
        sweep
    }
}

function AlertNotifications({ children }: PropsWithChildren) {
    let alerts = useProviderAlerts();
    return (
        <AlertContext.Provider value={alerts}>

            { children }
        </AlertContext.Provider>
    );
}

export default AlertNotifications;