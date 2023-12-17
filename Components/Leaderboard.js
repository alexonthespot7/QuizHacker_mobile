import { useContext, useState } from "react";
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';

import { Button, Icon, ListItem } from '@rneui/themed';

import AuthContext from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Loading from "./Loading";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);
    const { loginData, backEndUrl, handleBadResponse, handleResponseWithData } = useContext(AuthContext);

    const fetchLeaderboard = () => {
        setDataFetched(false);
        if (!loginData || !loginData.jwt || !loginData.id) {
            fetchNoAuth();
        } else {
            fetchWithAuth()
        }
    }

    const handleLeaderboardData = (data) => {
        setLeaderboard(data);
        setDataFetched(true);
    }

    const fetchNoAuth = async () => {
        try {
            const response = await fetch(`${backEndUrl}/users`);
            if (!response.ok) {
                Alert.alert('Something was wrong, try again later');
                return null;
            }
            handleResponseWithData(response, handleLeaderboardData);
        } catch (error) {
            Alert.alert('Something was wrong, try again later');
        }
    }

    const fetchWithAuth = async () => {
        try {
            const response = await fetch(`${backEndUrl}/usersauth/${loginData.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': loginData.jwt
                    }
                });
            if (!response.ok) {
                handleBadResponse(response);
                return null;
            }
            handleResponseWithData(response, handleLeaderboardData);
        } catch (error) {
            Alert.alert('Something was wrong, try again later');
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchLeaderboard();
        }, [loginData])
    );

    const renderListItem = (item, index) => {
        const authUserPosition = leaderboard.position;
        const currentPosition = index < 10 ? index + 1 : authUserPosition;

        const isNotInTopEleven = authUserPosition > 11;
        const isSamePosition = currentPosition === leaderboard.position;
        const isCurrentEleventhPosition = currentPosition > 10;
        const isCurrentGreaterThanThird = currentPosition > 3;

        // If the current authenticated user is not in the top eleven players we should show first 10 players and then dots and then current auth user's position
        const showDots = isNotInTopEleven && isCurrentEleventhPosition;

        const iconName = currentPosition === 1 ? 'trophy' : 'medal';

        const iconColor = currentPosition === 1
            ? 'gold'
            : currentPosition === 2
                ? 'silver'
                : '#CD7F32';

        const ratingFontSize = currentPosition === 1
            ? 24 : currentPosition === 2
                ? 22 : currentPosition === 3
                    ? 21 : 20;

        const ratingFontWeight = currentPosition === 1 ? 'bold' : 'normal';

        return (
            <ListItem>
                <ListItem.Content
                    style={{
                        ...styles.listItemContainer,
                        marginTop: showDots ? 25 : 0
                    }}
                >
                    {showDots &&
                        <View style={{ position: 'absolute', top: -45 }}>
                            <Icon name='more-horiz' size={40} />
                        </View>
                    }
                    {isCurrentGreaterThanThird &&
                        <Text style={{ ...styles.positionContainer, fontSize: 20, color: '#555555' }}>
                            {currentPosition}
                            {isSamePosition && <Icon type='font-awesome-5' name='star' color='gold' solid={true} size={20} style={{ marginLeft: 5 }} />}
                        </Text>
                    }
                    {!isCurrentGreaterThanThird &&
                        <View style={{ ...styles.positionContainer, flexDirection: 'row' }}>
                            <Icon type='font-awesome-5' name={iconName} color={iconColor} />
                            {isSamePosition && <Icon type='font-awesome-5' name='star' color='gold' solid={true} size={20} style={{ marginLeft: 5 }} />}
                        </View>
                    }
                    <Text style={{ fontSize: 20, color: '#555555' }}>
                        {item.username}
                    </Text>
                    <Text
                        style={{
                            ...styles.score,
                            fontWeight: ratingFontWeight,
                            fontSize: ratingFontSize
                        }}
                    >
                        {item.rating}
                    </Text>
                </ListItem.Content>
            </ListItem>
        );
    }

    return (
        <View style={styles.container}>
            {dataFetched &&
                <View style={{ marginBottom: 125 }}>
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
                        style={{ marginHorizontal: "2%" }}
                        renderItem={({ item, index }) => renderListItem(item, index)}
                        keyExtractor={item => item.username}
                        data={leaderboard.users}
                    />
                </View>
            }
            {!dataFetched && //Loading sign
                <Loading />
            }
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