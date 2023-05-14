import { useContext, useState } from "react";
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';

import { Button, Icon, ListItem } from '@rneui/themed';

import AuthContext from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);
    const { loginData } = useContext(AuthContext);

    const fetchLeaderboard = () => {
        if (!loginData || !loginData.jwt || !loginData.id) {
            fetch('https://quiz-hacker-back.herokuapp.com/users')
                .then(response => response.json())
                .then(data => {
                    setLeaderboard(data);
                    setDataFetched(true);
                })
                .catch(err => console.error(err));
        } else {
            fetch('https://quiz-hacker-back.herokuapp.com/usersauth/' + loginData.id,
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
                        setLeaderboard(data);
                        setDataFetched(true);
                    }
                })
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchLeaderboard();
        }, [loginData])
    );

    return (
        <View style={styles.container}>
            {dataFetched && <View>
                <Text style={styles.title}>
                    Leaderboard
                </Text>
                <View style={styles.headersContainer}>
                    <Text style={{ ...styles.propertyTitle, position: 'absolute', left: 0, }}>
                        Position:
                    </Text>
                    <Text style={styles.propertyTitle}>
                        Username:
                    </Text>
                    <Text style={{ ...styles.propertyTitle, position: 'absolute', right: '2.5%' }}>
                        Score:
                    </Text>
                </View>
                <FlatList
                    style={{ marginHorizontal: "2.5%" }}
                    renderItem={({ item, index }) =>
                        <ListItem>
                            <ListItem.Content
                                style={{
                                    ...styles.listItemContainer,
                                    marginTop: leaderboard.position > 10 && index + 1 !== leaderboard.position && index === 10 ? 25 : 0
                                }}
                            >
                                {leaderboard.position > 10 && index + 1 !== leaderboard.position && index === 10 &&
                                    <View style={{ position: 'absolute', top: -45 }}>
                                        <Icon name='more-horiz' size={40} />
                                    </View>
                                }
                                {index + 1 > 3 && <Text style={{ ...styles.positionContainer, fontSize: 20, color: '#555555' }}>
                                    {index !== 10 ? index + 1 : leaderboard.position}
                                    {(index + 1 === leaderboard.position || (index + 1 === 11 && leaderboard.position > 10)) && <Icon type='font-awesome-5' name='star' color='gold' solid={true} size={20} style={{ marginLeft: 5 }} />}
                                </Text>}
                                {index + 1 === 1 &&
                                    <View style={{ ...styles.positionContainer, flexDirection: 'row' }}>
                                        <Icon type='font-awesome-5' name='trophy' color='gold' />
                                        {(index + 1 === leaderboard.position) && <Icon type='font-awesome-5' name='star' color='gold' solid={true} size={20} style={{ marginLeft: 5 }} />}
                                    </View>
                                }
                                {index === 1 &&
                                    <View style={{ ...styles.positionContainer, flexDirection: 'row' }}>
                                        <Icon type='font-awesome-5' name='medal' color='silver' />
                                        {(index + 1 === leaderboard.position) && <Icon type='font-awesome-5' name='star' color='gold' solid={true} size={20} style={{ marginLeft: 5 }} />}
                                    </View>
                                }
                                {index === 2 &&
                                    <View style={{ ...styles.positionContainer, flexDirection: 'row' }}>
                                        <Icon type='font-awesome-5' name='medal' color='#CD7F32' />
                                        {(index + 1 === leaderboard.position) && <Icon type='font-awesome-5' name='star' color='gold' solid={true} size={20} style={{ marginLeft: 5 }} />}
                                    </View>
                                }
                                <Text style={{ fontSize: 20, color: '#555555' }}>
                                    {item.username}
                                </Text>
                                <Text
                                    style={{
                                        ...styles.score,
                                        fontWeight: index === 0 ? 'bold' : 'normal',
                                        fontSize: index === 0 ? 24 : index === 1 ? 22 : index === 2 ? 21 : 20
                                    }}
                                >
                                    {item.rating}
                                </Text>
                            </ListItem.Content>
                        </ListItem>
                    }
                    keyExtractor={item => item.username}
                    data={leaderboard.users}
                />
            </View>}
            {!dataFetched && <View style={styles.loading}>
                <Button title="Solid" type="solid" loading style={styles.loadingButton} />
            </View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headersContainer: {
        marginHorizontal: '5%',
        flexDirection: 'row',
        paddingHorizontal: 10,
        justifyContent: 'center',
        marginTop: 10
    },
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e6f7ff',
        height: 50,
        paddingHorizontal: 10,
    },
    title: {
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 24,
        color: '#8f959a'
    },
    propertyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b1b8be'
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
    },
    positionContainer: {
        position: 'absolute',
        left: 10
    },
    score: {
        position: 'absolute',
        right: 10,
        color: '#555555'
    }
});