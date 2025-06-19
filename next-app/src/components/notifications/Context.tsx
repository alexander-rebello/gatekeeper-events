import React, { createContext, useContext, useState, ReactNode } from "react";
import { Color } from "../utils";

type Notification = {
	id: number;
	message: string;
	variant: Color;
};

type NotificationContextType = {
	notifications: Notification[];
	addNotification: (message: string, variant?: Color) => void;
	removeNotification: (id: number) => void;
};

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const contextValue: NotificationContextType = {
		notifications,
		addNotification: (message, variant = Color.Info) => {
			// limit notifications to reduce browser lag and prevent infinite loops
			if (notifications.length <= 10) setNotifications((prev) => [...prev, { id: Date.now(), message, variant }]);
		},
		removeNotification: (id) => {
			setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
		},
	};

	return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
}
