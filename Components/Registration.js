import { Input, Button, } from '@rneui/themed';
import { useContext, useState } from 'react';

import { StyleSheet, View, Alert } from 'react-native';
import AuthContext from '../context/AuthContext';
import Loading from './Loading';

const initialUser = {
    username: "",
    email: '',
    password: ""
}

const initialErrorText = {
    username: "",
    email: '',
    password: "",
    verificationCode: ''
}

export default function Registration({ navigation }) {
    const [user, setUser] = useState(initialUser);
    const [passwordCheck, setPasswordCheck] = useState('');
    const [usernameError, setUsernameError] = useState(false);
    const [pwdError, setPwdError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [errorText, setErrorText] = useState(initialErrorText);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState(false);
    const [verify, setVerify] = useState(false);

    const { unverifiedId, receiveUnverifiedId, removeUnverifiedId, backEndUrl } = useContext(AuthContext);

    const handleBadResponseSignup = (response) => {
        if (response.status === 406) {
            setLoading(false);
            setEmailError(true);
            setErrorText({ ...errorText, email: 'Email is already in use' });
        } else if (response.status === 409) {
            setLoading(false);
            setUsernameError(true);
            setErrorText({ ...errorText, username: 'Username is already in use' });
        } else {
            Alert.alert('Something went wrong');
        }
    }

    const handleVerification = (response) => {
        const unverifiedId = response.headers.get('Host');
        receiveUnverifiedId(unverifiedId);
        setUser(initialUser);
        setLoading(false);
        setVerify(true);
        Alert.alert('The verification code was sent to your email');
    }

    const handleRegisteredAndVerified = () => {
        setUser(initialUser);
        setLoading(false);
        navigation.navigate('Login');
        Alert.alert('Registration went well. You can login now');
    }

    const fetchSignup = async () => {
        try {
            const response = await fetch(`${backEndUrl}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            if (!response.ok) {
                handleBadResponseSignup(response);
                return null;
            }
            if (response.status === 200) {
                handleVerification(response);
            } else {
                handleRegisteredAndVerified();
            }
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }

    const signup = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (user.username === '') {
            setUsernameError(true);
            setErrorText({ ...errorText, username: 'Username cannot be empty' });
        } else if (user.email === '') {
            setEmailError(true);
            setErrorText({ ...errorText, email: 'Email cannot be empty' });
        } else if (user.password.length < 4) {
            setPwdError(true);
            setErrorText({ ...errorText, password: 'Password must be at least 4 symbols' });
        } else if (user.password !== passwordCheck) {
            setPwdError(true);
            setErrorText({ ...errorText, password: 'Passwords must match' });
        } else if (!emailRegex.test(user.email)) {
            setEmailError(true);
            setErrorText({ ...errorText, email: 'Please provide valid email' });
        } else if (user.email.includes(' ')) {
            setEmailError(true);
            setErrorText({ ...errorText, email: 'Email cannot contain whitespaces' });
        } else if (user.username.includes(' ')) {
            setUsernameError(true);
            setErrorText({ ...errorText, username: 'Username cannot contain whitespaces' });
        } else {
            setLoading(true);
            fetchSignup();
        }
    }

    const handleBadResponseVerify = (response) => {
        if (response.status === 400) {
            setLoading(false);
            setCodeError(true);
            setErrorText({ ...errorText, verificationCode: 'Wrong user id or the user is already verified' });
        } else if (response.status === 409) {
            setLoading(false);
            setCodeError(true);
            setErrorText({ ...errorText, verificationCode: 'Verification code is incorrect' });
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

    const verifyFunction = () => {
        if (code === '') {
            setCodeError(true);
            setErrorText({ ...errorText, verificationCode: 'Please fill in this field first' });
        } else {
            setLoading(true);
            verifyReq();
        }
    }

    return (
        <View style={styles.container}>
            {!loading && !verify && !unverifiedId &&
                <View style={styles.subContainer}>
                    <Input
                        placeholder='Username'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={usernameError}
                        errorMessage={errorText.username}
                        onChangeText={username => {
                            setUser({ ...user, username: username });
                            if (usernameError) {
                                setUsernameError(false);
                                setErrorText(initialErrorText);
                            }
                        }}
                        value={user.username}
                    />
                    <Input
                        placeholder='Email'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={emailError}
                        errorMessage={errorText.email}
                        onChangeText={email => {
                            setUser({ ...user, email: email });
                            if (emailError) {
                                setEmailError(false);
                                setErrorText(initialErrorText);
                            }
                        }}
                        value={user.email}
                    />
                    <Input
                        secureTextEntry={true}
                        placeholder='Password'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={pwdError}
                        errorMessage={errorText.password}
                        onChangeText={password => {
                            setUser({ ...user, password: password });
                            if (pwdError) {
                                setPwdError(false);
                                setErrorText(initialErrorText);
                            }
                        }}
                        value={user.password}
                    />
                    <Input
                        secureTextEntry={true}
                        placeholder='Repeat password'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={pwdError}
                        errorMessage={errorText.password}
                        onChangeText={passwordCheck => setPasswordCheck(passwordCheck)}
                        value={passwordCheck}
                    />
                    <Button
                        style={styles.button}
                        onPress={signup}
                    >
                        Sign-up
                    </Button>
                </View>
            }
            {(!loading && (verify || unverifiedId)) &&
                <View style={styles.subContainer}>
                    <Input
                        placeholder='Code'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={codeError}
                        errorMessage={errorText.verificationCode}
                        onChangeText={code => {
                            setCode(code);
                            if (codeError) {
                                setCodeError(false);
                                setErrorText(initialErrorText);
                            }
                        }}
                        value={code}
                    />
                    <Button
                        style={styles.button}
                        onPress={verifyFunction}
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
        marginTop: '20%',
        width: 325
    },
    button: {
        marginTop: 10,
        width: 100
    }
});