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

    const backEndUrl = 'https://quiz-hacker-back-end.onrender.com/api';

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleAvatarURLGoodResponse = (response) => {
        response.text()
            .then(data => {
                if (data) {
                    setAvatarURL(data);
                } else {
                    setAvatarURL(null);
                }
                setFetchingAvatar(false);
            })
            .catch(error => {
                console.error(error);
                setFetchingAvatar(false);
            });
    }

    const fetchAvatarURL = async (id, token) => {
        try {
            const response = await fetch(`${backEndUrl}/getavatar/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token
                    }
                });
            if (!response.ok) {
                handleBadResponse(response);
                return null;
            }
            handleAvatarURLGoodResponse(response);
        } catch (error) {
            console.error(error);
        }
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

    const handleBadResponse = (response) => {
        if ([401, 500].includes(response.status)) {
            logOutData();
            Alert.alert('Please re-login to prove your authentication');
        } else {
            Alert.alert('Something went wrong');
        }
    }

    const handleResponseWithData = (response, handleData) => {
        response.json()
            .then(data => {
                handleData(data);
            })
            .catch(err => {
                console.error(err);
                Alert.alert('Something was wrong, try again later');
            });
    }

    return (
        <AuthContext.Provider
            value={{
                unverifiedId, logOutData, loginData, loginMake, receiveUnverifiedId,
                removeUnverifiedId, processStarted, setProcessStarted, avatarURL, setAvatarURL,
                backEndUrl, handleBadResponse, handleResponseWithData
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
}

export default ContextProvider;