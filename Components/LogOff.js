import { Avatar, BottomSheet, ListItem } from "@rneui/themed";
import { useContext, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthContext from "../context/AuthContext";

export default function LogOff({ navigation }) {
    const [isVisible, setIsVisible] = useState(false);

    const { logOutData } = useContext(AuthContext);

    const logOut = () => {
        logOutData();
        Alert.alert('You\'ve just logged out');
        navigation.navigate('Leaderboard')
        setIsVisible(false);
    }

    const navigateTo = () => {
        navigation.navigate('Personal');
        setIsVisible(false);
    }

    const list = [
        {
            title: 'Personal Page',
            onPress: navigateTo,
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
            <Avatar
                size={30}
                rounded
                icon={{ name: "user", type: "font-awesome", color: '#b0c1c8' }}
                containerStyle={{ backgroundColor: "#fff" }}
                onPress={() => setIsVisible(true)}
            />
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