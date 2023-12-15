import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import AuthContext from "./AuthContext";
import { Alert } from "react-native";

function ContextProvider(props) {
    const [loginData, setLoginData] = useState(null);
    const [unverifiedId, setUnverifiedId] = useState(null);
    const [processStarted, setProcessStarted] = useState(false);
    const [avatarURL, setAvatarURL] = useState(null);
    const [fetchingAvatar, setFetchingAvatar] = useState(false);

    async function fetchData() {
        const token = await AsyncStorage.getItem('jwt');
        const id = await AsyncStorage.getItem('id');
        const role = await AsyncStorage.getItem('role');
        if (token && id && role) {
            setLoginData({ jwt: token, id: id, role: role });
            if (!fetchingAvatar) {
                setFetchingAvatar(true);
                fetchAvatarURL(id, token);
            }
        } else {
            setLoginData(null);
            const unverId = await AsyncStorage.getItem('unverifiedId');
            if (unverId) {
                setUnverifiedId(unverId);
            } else {
                setUnverifiedId(null);
            }
            setAvatarURL(null);
            setFetchingAvatar(false);
        }
    }

    async function logOutData() {
        await AsyncStorage.removeItem('jwt');
        await AsyncStorage.removeItem('id');
        await AsyncStorage.removeItem('role');
        await AsyncStorage.removeItem('unverifiedId');
        setAvatarURL(null);
        fetchData();
    }

    const fetchAvatarURL = (id, token) => {
        fetch(`${process.env.REACT_APP_API_URL}/getavatar/${id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                }
            })
            .then(response => {
                if (response.status === 401) {
                    throw new Error('Unauthorized request');
                }
                return response.text();
            })
            .then(data => {
                if (data) {
                    setAvatarURL(data);
                } else {
                    setAvatarURL(null);
                }
                setFetchingAvatar(false);
            })
            .catch(error => {
                if (error.message === 'Unauthorized request') {
                    if (!fetchingAvatar) {
                        setFetchingAvatar(true);
                        logOutData();
                        Alert.alert('Your current session expired. Please login.')
                    }
                } else {
                    console.error(error);
                    setFetchingAvatar(false);
                }
            });
    }

    async function receiveUnverifiedId(unverId) {
        await AsyncStorage.setItem('unverifiedId', unverId);
        fetchData();
    }

    async function loginMake(token, id, role) {
        await AsyncStorage.setItem('jwt', token);
        await AsyncStorage.setItem('id', id);
        await AsyncStorage.setItem('role', role);
        await AsyncStorage.removeItem('unverifiedId');
        fetchData();
    }

    async function removeUnverifiedId() {
        await AsyncStorage.removeItem('unverifiedId');
        fetchData();
    }



    useEffect(() => {
        fetchData();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                unverifiedId, logOutData, loginData, loginMake, receiveUnverifiedId,
                removeUnverifiedId, processStarted, setProcessStarted, avatarURL, setAvatarURL
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export default ContextProvider;