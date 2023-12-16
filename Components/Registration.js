import { Input, Button, } from '@rneui/themed';
import { useContext, useState } from 'react';

import { StyleSheet, View, Alert } from 'react-native';
import AuthContext from '../context/AuthContext';

export default function Registration({ navigation }) {
    const [user, setUser] = useState({
        username: "",
        email: '',
        password: ""
    });
    const [passwordCheck, setPasswordCheck] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [pwdError, setPwdError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState(false);
    const [verify, setVerify] = useState(false);

    const { unverifiedId, receiveUnverifiedId, removeUnverifiedId, backEndUrl } = useContext(AuthContext);

    const loginReq = () => {
        fetch(`${backEndUrl}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        })
            .then(response => {
                if (response.ok) {
                    if (response.status === 200) {
                        const unverifiedId = response.headers.get('Host');
                        receiveUnverifiedId(unverifiedId);
                        setUser({
                            username: '',
                            email: '',
                            password: ''
                        });
                        setLoading(false);
                        setVerify(true);
                        Alert.alert('The verification code was sent to your email');
                    } else {
                        setUser({
                            username: '',
                            email: '',
                            password: ''
                        });
                        setLoading(false);
                        navigation.navigate('Login');
                        Alert.alert('Registration went well. You can login now');
                    }
                } else if (response.status === 406) {
                    setLoading(false);
                    setEmailError(true);
                    setErrorText('Email is already in use');
                } else if (response.status === 409) {
                    setLoading(false);
                    setUsernameError(true);
                    setErrorText('Username is already in use');
                } else {
                    setLoading(false);
                    Alert.alert('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }


    const signup = () => {
        if (user.username === '') {
            setUsernameError(true);
            setErrorText('Username cannot be empty');
        } else if (user.password === '') {
            setEmailError(true);
            setErrorText('Email cannot be empty');
        } else if (user.password !== passwordCheck) {
            setPwdError(true);
            setErrorText('Passwords must match');
        } else {
            setLoading(true);
            loginReq();
        }
    }

    const verifyReq = () => {
        fetch(`${backEndUrl}/verify/${unverifiedId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: code
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

    const verifyFunction = () => {
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
            {!loading && !verify && !unverifiedId && <View style={styles.subContainer}>
                <Input
                    placeholder='Username'
                    errorStyle={{ color: 'red' }}
                    renderErrorMessage={usernameError}
                    errorMessage={errorText}
                    onChangeText={username => {
                        setUser({ ...user, username: username });
                        setUsernameError(false);
                    }}
                    value={user.username}
                />
                <Input
                    placeholder='Email'
                    errorStyle={{ color: 'red' }}
                    renderErrorMessage={emailError}
                    errorMessage={errorText}
                    onChangeText={email => {
                        setUser({ ...user, email: email });
                        setEmailError(false);
                    }}
                    value={user.email}
                />
                <Input
                    secureTextEntry={true}
                    placeholder='Password'
                    errorStyle={{ color: 'red' }}
                    renderErrorMessage={pwdError}
                    errorMessage={errorText}
                    onChangeText={password => {
                        setUser({ ...user, password: password });
                        setPwdError(false);
                    }}
                    value={user.password}
                />
                <Input
                    secureTextEntry={true}
                    placeholder='Repeat password'
                    errorStyle={{ color: 'red' }}
                    renderErrorMessage={pwdError}
                    errorMessage={errorText}
                    onChangeText={passwordCheck => setPasswordCheck(passwordCheck)}
                    value={passwordCheck}
                />
                <Button
                    style={styles.button}
                    onPress={signup}
                >
                    Sign-up
                </Button>
            </View>}
            {(!loading && (verify || unverifiedId)) && <View style={styles.subContainer}>
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
                    onPress={verifyFunction}
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
        marginTop: '20%',
        width: 325
    },
    button: {
        marginTop: 10,
        width: 100
    }
});