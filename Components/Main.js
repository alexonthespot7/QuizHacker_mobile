import * as React from 'react';

import { Header, Icon } from '@rneui/themed';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { DrawerActions, NavigationContainer } from '@react-navigation/native';
import Login from './Login';
import { TouchableOpacity } from 'react-native-gesture-handler';
import LogOff from './LogOff';
import AuthContext from '../context/AuthContext';
import Leaderboard from './Leaderboard';
import SignIn from './SignIn';
import Registration from './Registration';
import Quizzes from './Quizzes';
import PersonalPage from './PersonalPage';
import PersonalQuizzes from './PersonalQuizzes';
import QuizCreation from './QuizCreation';
import QuestionsCreation from './QuestionsCreation';
import QuizTaking from './QuizTaking';
import PublishedQuiz from './PublishedQuiz';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator(); // Create a new stack navigator

function MainStack() { // Define the stack navigator
    const { loginData } = React.useContext(AuthContext);

    return (
        <Stack.Navigator>
            {loginData && loginData.jwt && loginData.id && <Stack.Screen name="Personal Page" options={{ title: '', headerShown: false }} component={PersonalPage} />}
            {loginData && loginData.jwt && loginData.id && <Stack.Screen name="My Quizzes" options={{ title: '', headerShown: true }} component={PersonalQuizzes} />}
            {loginData && loginData.jwt && loginData.id && <Stack.Screen name="QuizCreation" options={{ title: '', headerShown: true }} component={QuizCreation} />}
            {loginData && loginData.jwt && loginData.id && <Stack.Screen name="QuestionsCreation" options={{ title: '', headerShown: true }} component={QuestionsCreation} />}
            {loginData && loginData.jwt && loginData.id && <Stack.Screen name="MyPublishedQuiz" options={{ title: '', headerShown: true }} component={PublishedQuiz} />}
        </Stack.Navigator>
    );
}

function QuizTakingStack() { // Define the stack navigator
    const { loginData, processStarted } = React.useContext(AuthContext);

    return (
        <Stack.Navigator>
            <Stack.Screen name="Quizzes" options={{ title: '', headerShown: false }} component={Quizzes} />
            {loginData && loginData.jwt && loginData.id && <Stack.Screen name="QuizTaking" options={{ title: '', headerShown: !processStarted }} component={QuizTaking} />}
        </Stack.Navigator>
    );
}

export default function Main() {
    const { loginData } = React.useContext(AuthContext);

    return (
        <NavigationContainer>
            <Drawer.Navigator
                screenOptions={{
                    header: ({ navigation }) =>
                        <Header
                            containerStyle={{ alignItems: 'center', paddingHorizontal: 15 }}
                            leftComponent={
                                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                                    <Icon color='white' name='menu' size={30} />
                                </TouchableOpacity>
                            }
                            centerComponent={{ text: "QuizHacker", style: { fontSize: 20, color: 'white' } }}
                            rightComponent={
                                loginData && loginData.jwt && loginData.id ? <LogOff navigation={navigation} /> : <SignIn navigation={navigation} />
                            }
                        />
                }}
                useLegacyImplementation
                initialRouteName="Leaderboard"
            >
                {!loginData && <Drawer.Screen name="Login" component={Login} />}
                {!loginData && <Drawer.Screen name="Registration" component={Registration} />}
                {loginData && loginData.jwt && loginData.id && <Drawer.Screen name="Personal" component={MainStack} />}
                <Drawer.Screen name="Leaderboard" component={Leaderboard} />
                <Drawer.Screen name="All Quizzes" options={{ title: 'Quizzes' }} component={QuizTakingStack} />
            </Drawer.Navigator>
        </NavigationContainer >
    );
}