import { Button } from "@rneui/themed";
import { View, StyleSheet } from "react-native";

export default function Loading() {
    return (
        <View style={styles.loading}>
            <Button title="Solid" type="solid" loading style={styles.loadingButton} />
        </View>
    );
}

const styles = StyleSheet.create({
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
});