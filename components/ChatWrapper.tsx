import AsyncStore from '@/src/utils/AsyncStore';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StreamChat } from 'stream-chat';
import { useCreateChatClient } from "stream-chat-expo";

const chatUserToken = process.env.EXPO_PUBLIC_CHAT_USER_TOKEN;
const chatApiKey = process.env.EXPO_PUBLIC_CHAT_API_KEY;
const chatUserId = process.env.EXPO_PUBLIC_CHAT_USER_ID;
const chatUserName = process.env.EXPO_PUBLIC_CHAT_USER_NAME;
const [chatClient, setChatClient] = useState<any>(null);
const [isConnecting, setIsConnecting] = useState(true);
const [unreadCount, setUnreadCount] = useState<number>();

const user = {
    id: chatUserId || '',
    name: chatUserName || '',
};

const requestNotificationPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const isEnabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    console.log('Permission Status', { authStatus, isEnabled });
};

import { ReactNode } from "react";

export const ChatWrapper = ({ children }: { children: ReactNode }) => {
    const chatClient = useCreateChatClient({
        apiKey: chatApiKey || '',
        userData: user,
        tokenOrProvider: chatUserToken,
    });

    useEffect(() => {
        const run = async () => {
            await requestNotificationPermission();
            await switchUser();
        };
        run();
        //return unsubscribePushListenersRef.current;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loginUser = async (config: any) => {
        // unsubscribe from previous push listeners
        //unsubscribePushListenersRef.current?.();
        const client = StreamChat.getInstance<any>(config.apiKey, {
            timeout: 6000,
            // logger: (type, msg) => console.log(type, msg)
        });
        setChatClient(client);

        const user = {
            id: config.userId,
            image: config.userImage,
            name: config.userName,
        };
        const connectedUser = await client.connectUser(user, config.userToken);
        const initialUnreadCount = connectedUser?.me?.total_unread_count;
        setUnreadCount(initialUnreadCount);
        await AsyncStore.setItem('@stream-rn-salesrepmodule-login-config', config);

        const permissionAuthStatus = await messaging().hasPermission();
        const isEnabled =
            permissionAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            permissionAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (isEnabled) {
            // Register FCM token with stream chat server.
            const token = await messaging().getToken();
            await client.addDevice(token, 'firebase', client.userID, 'rn-fcm');

            // Listen to new FCM tokens and register them with stream chat server.
            const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken: any) => {
                await client.addDevice(newToken, 'firebase', client.userID, 'rn-fcm');
            });
            // show notifications when on foreground
            const unsubscribeForegroundMessageReceive = messaging().onMessage(async (remoteMessage: any) => {
                const messageId = remoteMessage.data?.id;
                if (!messageId) {
                    return;
                }
                const message = await client.getMessage(messageId);
                if (message.message.user?.name && message.message.text) {
                    // create the android channel to send the notification to
                    const channelId = await notifee.createChannel({
                        id: 'foreground',
                        name: 'Foreground Messages',
                    });
                    // display the notification on foreground
                    const { stream, ...rest } = remoteMessage.data ?? {};
                    const data = {
                        ...rest,
                        ...((stream as unknown as Record<string, string> | undefined) ?? {}), // extract and merge stream object if present
                    };
                    await notifee.displayNotification({
                        android: {
                            channelId,
                            pressAction: {
                                id: 'default',
                            },
                        },
                        body: message.message.text,
                        data,
                        title: 'New message from ' + message.message.user.name,
                    });
                }
            });

            // unsubscribePushListenersRef.current = () => {
            //     unsubscribeTokenRefresh();
            //     unsubscribeForegroundMessageReceive();
            // };
        }
        setChatClient(client);
    };

    const switchUser = async (userId?: string) => {
        setIsConnecting(true);

        try {
            if (userId) {
                await loginUser({
                    apiKey: '7ge5mdgwb5sf',
                    userId: chatUserId,
                    userName: chatUserName,
                    userImage: null,
                    userToken: chatUserToken,
                });
            } else {
                const config = await AsyncStore.getItem<any | null>(
                    '@stream-rn-salesrepmodule-login-config',
                    null,
                );

                if (config) {
                    await loginUser(config);
                }
            }
        } catch (e) {
            console.warn(e);
        }
        setIsConnecting(false);
    };

    if (!chatClient) {
        return (
            <SafeAreaView>
                <Text>Loading chat ...</Text>
            </SafeAreaView>
        );
    }

    return <>{children}</>;
};