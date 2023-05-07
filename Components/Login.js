import { Input, Button, Icon } from '@rneui/themed';
import { useContext, useState } from 'react';

import { StyleSheet, View, Alert } from 'react-native';

import AuthContext from '../context/AuthContext';

export default function Login({ navigation }) {
    const [user, setUser] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);
    const [verify, setVerify] = useState(false);
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState(false);

    const { unverifiedId, loginMake, receiveUnverifiedId, removeUnverifiedId } = useContext(AuthContext);

    const loginReq = () => {
        fetch('https://quiz-hacker-back.herokuapp.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
            .then(response => {
                if (response.ok) {
                    const jwtToken = response.headers.get('Authorization');
                    const localId = response.headers.get('Host');
                    if (jwtToken !== null) {
                        const role = response.headers.get('Allow');
                        loginMake(jwtToken, localId, role);
                        setUser({
                            username: '',
                            password: ''
                        });
                        setLoading(false);
                        navigation.navigate('Leaderboard');
                        Alert.alert('Everything went successfully');
                    }
                } else if (response.status === 401) {
                    setLoading(false);
                    setError(true);
                    setErrorText('Incorrect credentials');
                } else if (response.status === 202) {
                    const unverifiedId = response.headers.get('Host');
                    receiveUnverifiedId(unverifiedId);
                    setUser({
                        username: '',
                        password: ''
                    });
                    setLoading(false);
                    setVerify(true);
                    Alert.alert('The verification code was sent to your email');
                } else {
                    setProgress(false);
                    Alert.alert('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }


    const login = () => {
        if (user.username === '') {
            setError(true);
            setErrorText('These fields cannto be empty');
        } else if (user.password === '') {
            setError(true);
            setErrorText('These fields cannto be empty');
        } else {
            setLoading(true);
            loginReq();
        }
    }

    const verifyReq = () => {
        fetch('https://quiz-hacker-back.herokuapp.com/verify/' + unverifiedId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(code)
        })
            .then(response => {
                if (response.ok) {
                    removeUnverifiedId();
                    Alert.alert('verification went well');
                    setLoading(false);
                } else if (response.status === 400) {
                    setLoading(false);
                    setCodeError(true);
                    setErrorText('Wrong user id or the user is already verified');
                } else if (response.status === 409) {
                    setLoading(false);
                    setCodeError(true);
                    setErrorText('Verification code is incorrect');
                } else {
                    setLoading(false);
                    Alert.alert('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
            });
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
            {!loading && !verify && <View style={styles.subContainer}>
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
            </View>}
            {!loading && verify && <View style={styles.subContainer}>
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
            </View>}
            {loading &&
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <Button title="Solid" type="solid" loading style={{ borderRadius: 25 }} />
                </View>}
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