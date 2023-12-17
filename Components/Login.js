import { Input, Button, Icon } from '@rneui/themed';
import { useContext, useState } from 'react';

import { StyleSheet, View, Alert } from 'react-native';

import AuthContext from '../context/AuthContext';
import Loading from './Loading';

const initialUser = {
    username: '',
    password: ''
}

export default function Login({ navigation }) {
    const [user, setUser] = useState(initialUser);
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);
    const [verify, setVerify] = useState(false);
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState(false);

    const { unverifiedId, loginMake, receiveUnverifiedId, removeUnverifiedId, backEndUrl } = useContext(AuthContext);

    const handleBadResponseLogin = (response) => {
        if (response.status === 400) {
            setLoading(false);
            setError(true);
            setErrorText('Wrong username');
        } else if (response.status === 401) {
            setLoading(false);
            setError(true);
            setErrorText('Wrong password');
        } else {
            Alert.alert('Something went wrong');
        }
    }

    const handleResponseUserAutoVerified = () => {
        setUser(initialUser);
        setLoading(false);
        Alert.alert('You are verified now and you can login');
    }

    const handleResponseVerificationStarts = (response) => {
        const unverifiedId = response.headers.get('Host');
        receiveUnverifiedId(unverifiedId);
        setUser(initialUser);
        setLoading(false);
        setVerify(true);
        Alert.alert('The verification code was sent to your email');
    }

    const handleGoodLoginResponse = (response) => {
        const jwtToken = response.headers.get('Authorization');
        const localId = response.headers.get('Host');
        if (jwtToken !== null) {
            const role = response.headers.get('Allow');
            loginMake(jwtToken, localId, role);
            setUser(initialUser);
            setLoading(false);
            navigation.navigate('Leaderboard');
            Alert.alert('Everything went successfully');
        } else {
            Alert.alert('Something went wrong');
        }
    }

    const loginReq = async () => {
        try {
            const response = await fetch(`${backEndUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                handleBadResponseLogin(response);
                return null;
            }
            if (response.status === 201) {
                handleResponseUserAutoVerified();
            } else if (response.status === 202) {
                handleResponseVerificationStarts(response);
            } else {
                handleGoodLoginResponse(response);
            }
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }


    const login = () => {
        if (user.username === '') {
            setError(true);
            setErrorText('The username is mandatory');
        } else if (user.password === '') {
            setError(true);
            setErrorText('The password is mandatory');
        } else {
            setLoading(true);
            loginReq();
        }
    }

    const handleBadResponseVerify = (response) => {
        if (response.status === 400) {
            setLoading(false);
            setCodeError(true);
            setErrorText('Wrong user id or the user is already verified');
        } else if (response.status === 409) {
            setLoading(false);
            setCodeError(true);
            setErrorText('Verification code is incorrect');
        } else {
            Alert.alert('Something went wrong');
        }
    }

    const handleGoodResponseVerify = () => {
        removeUnverifiedId();
        Alert.alert('verification went well');
        setLoading(false);
    }

    const verifyReq = async () => {
        try {
            const response = await fetch(`${backEndUrl}/verify/${unverifiedId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: code
            });
            if (!response.ok) {
                handleBadResponseVerify(response);
                return null;
            }
            handleGoodResponseVerify();
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }

    const verifyCheck = () => {
        if (code === '') {
            setCodeError(true);
            setErrorText('Please fill in this field first');
        } else {
            setLoading(true);
            verifyReq();
        }
    }

    return (
        <View style={styles.container}>
            {!loading && !verify &&
                <View style={styles.subContainer}>
                    <Input
                        name='username'
                        placeholder='Login'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={error}
                        errorMessage={errorText}
                        onChangeText={username => {
                            setUser({ ...user, username: username });
                            setError(false);
                        }}
                        value={user.username}
                    />
                    <Input
                        name='password'
                        secureTextEntry={true}
                        placeholder='Password'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={error}
                        errorMessage={errorText}
                        onChangeText={password => {
                            setUser({ ...user, password: password });
                            setError(false);
                        }}
                        value={user.password}
                    />
                    <Button
                        style={styles.button}
                        onPress={login}
                    >
                        Login
                        <Icon name="login" color="white" style={{ marginLeft: 10 }} />
                    </Button>
                </View>
            }
            {!loading && verify &&
                <View style={styles.subContainer}>
                    <Input
                        placeholder='Code'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={codeError}
                        errorMessage={errorText}
                        onChangeText={code => {
                            setCode(code);
                            setCodeError(false);
                        }}
                        value={code}
                    />
                    <Button
                        style={styles.button}
                        onPress={verifyCheck}
                    >
                        Verify
                    </Button>
                </View>
            }
            {loading &&
                <Loading />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#fff',
        gap: 5
    },
    subContainer: {
        alignItems: 'center',
        gap: 20,
        marginTop: '25%',
        width: 250
    },
    button: {
        marginTop: 25,
        width: 100
    }
});