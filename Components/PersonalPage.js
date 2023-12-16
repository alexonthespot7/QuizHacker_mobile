import { useFocusEffect } from '@react-navigation/native';
import { Icon } from '@rneui/base';
import { Button, Text, Card } from '@rneui/themed';
import { useCallback } from 'react';
import { useContext, useState } from 'react';

import { StyleSheet, View, Alert } from 'react-native';

import AuthContext from '../context/AuthContext';
import CameraScreen from './CameraScreen';

export default function PersonalPage({ navigation }) {
    const [user, setUser] = useState({
        "username": "",
        "email": "",
        "score": 0,
        "attempts": 0,
        "position": -1
    });
    const [dataFetched, setDataFetched] = useState(false);

    const { loginData, backEndUrl } = useContext(AuthContext);

    const fetchUser = () => {
        fetch(`${backEndUrl}/users/${loginData.id}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loginData.jwt
                }
            })
            .then(response => {
                if (response.status === 401) {
                    throw new Error('Unauthorized request');
                }
                return response.json();
            })
            .then(data => {
                if (!data) {
                    Alert.alert('Please re-login')
                } else {
                    setUser(data);
                    setDataFetched(true);
                }
            })
    }

    useFocusEffect(
        useCallback(() => {
            fetchUser();
        }, [loginData])
    );

    return (
        <View style={styles.container}>
            {dataFetched && <Card containerStyle={{ flex: user.position !== -1 ? 0.85 : 0.75, marginTop: 30 }}>
                <Card.Title>PERSONAL PAGE</Card.Title>
                <Card.Divider />
                <View style={styles.propertyContainer}>
                    <Text style={styles.propertyTitle}>Username:</Text>
                    <Text style={styles.propertyValue}>{user.username}</Text>
                </View>
                <View style={styles.propertyContainer}>
                    <Text style={styles.propertyTitle}>Email:</Text>
                    <Text style={styles.propertyValue}>{user.email}</Text>
                </View>
                <View style={styles.propertyContainer}>
                    <Text style={styles.propertyTitle}>Score:</Text>
                    <Text style={styles.propertyValue}>{user.score}</Text>
                </View>
                <View style={styles.propertyContainer}>
                    <Text style={styles.propertyTitle}>Attempts:</Text>
                    <Text style={styles.propertyValue}>{user.attempts}</Text>
                </View>
                <View style={styles.propertyContainer}>
                    <Text style={styles.propertyTitle}>Average Score:</Text>
                    <Text style={styles.propertyValue}>{user.attempts === 0 ? 0 : (user.score / user.attempts).toFixed(2)}</Text>
                </View>
                {user.position !== -1 && <View style={styles.propertyContainer}>
                    <Text style={styles.propertyTitle}>Position:</Text>
                    <Text style={styles.propertyValue}>{user.position}</Text>
                </View>}
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <Button style={{ width: 130 }} onPress={() => navigation.navigate('My Quizzes')}>
                        My Quizzes
                    </Button>
                    <CameraScreen />
                </View>
            </Card>}
            {!dataFetched && <View style={styles.loading}>
                <Button title="Solid" type="solid" loading style={styles.loadingButton} />
            </View>}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    propertyContainer: {
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 25
    },
    propertyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b1b8be'
    },
    propertyValue: {
        fontSize: 20
    },
    loading: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center'
    },
    loadingButton: {
        borderRadius: 25,
        width: 80,
        height: 80
    }
});