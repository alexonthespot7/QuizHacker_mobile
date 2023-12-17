import { Avatar, BottomSheet, ListItem } from "@rneui/themed";
import { useContext, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthContext from "../context/AuthContext";

export default function LogOff({ navigation }) {
    const [isVisible, setIsVisible] = useState(false);

    const { logOutData, avatarURL } = useContext(AuthContext);

    const logOut = () => {
        logOutData();
        Alert.alert('You\'ve just logged out');
        navigation.navigate('Leaderboard')
        setIsVisible(false);
    }

    const navigateToPersonal = () => {
        navigation.navigate('Personal');
        setIsVisible(false);
    }

    const list = [
        {
            title: 'Personal Page',
            onPress: navigateToPersonal,
            containerStyle: { height: 100 }
        },
        {
            title: 'Log out',
            containerStyle: { backgroundColor: 'red', height: 100 },
            titleStyle: { color: 'white' },
            onPress: logOut,
        },
    ];
    return (
        <SafeAreaProvider>
            {!avatarURL &&
                <Avatar
                    size={30}
                    rounded
                    icon={{ name: "user", type: "font-awesome", color: '#b0c1c8' }}
                    containerStyle={{ backgroundColor: "#fff" }}
                    onPress={() => setIsVisible(true)}
                />
            }
            {avatarURL &&
                <Avatar
                    size={30}
                    rounded
                    source={{ uri: avatarURL }}
                    onPress={() => setIsVisible(true)}
                />
            }
            <BottomSheet isVisible={isVisible} onBackdropPress={() => setIsVisible(false)}>
                {list.map((item, index) => (
                    <ListItem
                        key={index}
                        containerStyle={item.containerStyle}
                        onPress={item.onPress}
                    >
                        <ListItem.Content>
                            <ListItem.Title style={item.titleStyle}>{item.title}</ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </BottomSheet>
        </SafeAreaProvider >
    );
}