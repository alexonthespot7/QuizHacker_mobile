import { Icon } from "@rneui/base";
import { BottomSheet, ListItem } from "@rneui/themed";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function SignIn({ navigation }) {
    const [isVisible, setIsVisible] = useState(false);


    const navigateTo = (path) => {
        navigation.navigate(path);
        setIsVisible(false);
    }

    const list = [
        {
            title: 'Registration',
            onPress: navigateTo,
            containerStyle: { height: 100 },
            onPress: () => navigateTo('Registration')
        },
        {
            title: 'Log In',
            containerStyle: { backgroundColor: '#4082cf', height: 100 },
            titleStyle: { color: 'white' },
            onPress: () => navigateTo('Login'),
        },
    ];
    return (
        <SafeAreaProvider>
            <Icon
                size={30}
                rounded
                name="log-in" type="feather" color='#fff'
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