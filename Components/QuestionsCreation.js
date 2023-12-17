import { useContext, useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Alert, KeyboardAvoidingView } from 'react-native';
import { Text, Button, Icon, ListItem, Overlay } from '@rneui/themed';
import AuthContext from "../context/AuthContext";
import AnswersCreation from "./AnswersCreation";
import Loading from "./Loading";

export default function QuestionsCreation({ route, navigation }) {
    const { quizId } = route.params;

    const [questions, setQuestions] = useState([]);
    const [dataFetched, setDataFetched] = useState(true);
    const [dataSaved, setDataSaved] = useState(false);

    const { loginData, backEndUrl, handleBadResponse, handleResponseWithData } = useContext(AuthContext);

    const handleQuestionsData = (data) => {
        setQuestions(data);
        setDataFetched(true);
    }

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${backEndUrl}/questions/${quizId}`, {
                headers: {
                    'Authorization': loginData.jwt
                }
            });
            if (!response.ok) {
                Alert.alert('Something is wrong with the server');
                return null;
            }
            handleResponseWithData(response, handleQuestionsData);
        } catch (error) {
            Alert.alert('Something is wrong with the server');
        }
    }

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchDeleteQuestion = async (questionId) => {
        try {
            const response = await fetch(`${backEndUrl}/deletequestion/${questionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': loginData.jwt
                },
            });
            if (!response.ok) {
                handleBadResponse(response);
                return null;
            }
            fetchQuestions();
        } catch (error) {
            Alert.alert('Something is wrong with the server');
        }
    }

    const changeQuestionText = (text, index) => {
        setDataSaved(false);
        const newQuestions = [...questions];
        newQuestions[index].text = text;
        setQuestions(newQuestions);
    }

    const addQuestion = () => {
        setDataSaved(false);
        const newQuestions = [...questions];
        const newQuestion = {
            "questionId": -newQuestions.length,
            "text": "Question",
            "quiz": {
                "quizId": questions[0].quiz.quizId,
                "title": questions[0].quiz.title
            },
            "answers": [
                {
                    "answerId": -1,
                    "text": "Answer1",
                    "correct": true
                },
                {
                    "answerId": -2,
                    "text": "Answer2",
                    "correct": false
                },
                {
                    "answerId": -3,
                    "text": "Answer3",
                    "correct": false
                },
                {
                    "answerId": -4,
                    "text": "Answer4",
                    "correct": false
                }
            ]
        }
        newQuestions.push(newQuestion);
        setQuestions(newQuestions);
    }

    const deleteItem = (questionId, index) => {
        if (questionId < 0) {
            const newQuestions = [...questions];
            newQuestions.splice(index, 1);
            setQuestions(newQuestions);
        } else {
            setDataFetched(false);
            fetchDeleteQuestion(questionId);
        }
    }

    const saveAll = () => {
        setDataFetched(false);
        fetchSaveQuestions();
    }

    const fetchSaveQuestions = async () => {
        try {
            const response = await fetch(`${backEndUrl}/savequestions/${questions[0].quiz.quizId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loginData.jwt
                },
                body: JSON.stringify(questions)
            });
            if (!response.ok) {
                handleBadResponse(response);
                return null;
            }
            fetchQuestions();
            setDataSaved(true);
        } catch (error) {
            Alert.alert('Something is wrong with the server');
        }
    }

    const publishQuiz = async () => {
        setDataFetched(false);
        try {
            const response = await fetch(`${backEndUrl}/publishquiz/${questions[0].quiz.quizId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': loginData.jwt
                }
            });

            if (!response.ok) {
                handleBadResponse(response);
                return null;
            }
            setDataFetched(true);
            navigation.navigate('My Quizzes');
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }

    return (
        <KeyboardAvoidingView behavior="padding" enabled style={styles.container}>
            {dataFetched && questions.length > 0 &&
                <View style={{ flex: 0.9 }}>
                    <Text style={styles.title}>
                        {questions[0].quiz.title}
                    </Text>
                    <FlatList
                        style={{ marginLeft: "5%" }}
                        renderItem={({ item, index }) =>
                            <ListItem.Swipeable
                                bottomDivider
                                rightContent={() => (
                                    <Button
                                        containerStyle={{
                                            flex: 1,
                                            backgroundColor: '#f4f4f4',
                                            justifyContent: 'center'
                                        }}
                                        type="clear"
                                        icon={{ name: 'delete-outline', size: 34 }}
                                        onPress={() => deleteItem(item.questionId, index)}
                                    />
                                )}
                            >
                                <ListItem.Content >
                                    <ListItem.Input
                                        rightIcon={<Icon name="edit" />}
                                        textAlign='left'
                                        label={`Question ${index + 1}`}
                                        placeholder='Question'
                                        onChangeText={text => changeQuestionText(text, index)}
                                        value={item.text}
                                    />
                                    <AnswersCreation
                                        item={item}
                                        index={index}
                                        questions={questions}
                                        setQuestions={setQuestions}
                                        setDataSaved={setDataSaved}
                                    />
                                </ListItem.Content>
                            </ListItem.Swipeable>
                        }
                        keyExtractor={item => item.questionId}
                        data={questions}
                    />
                    <View style={{ alignItems: 'center', gap: 20, marginTop: 10 }}>
                        <Button
                            onPress={addQuestion}
                            style={styles.button}
                        >
                            <Icon name="add" color="white" style={{ marginRight: 10 }} />
                            Question
                        </Button>
                        {!dataSaved &&
                            <Button
                                onPress={saveAll}
                                style={styles.button}
                            >
                                <Icon name='save' color='white' style={{ marginRight: 5 }} />
                                Save
                            </Button>
                        }
                        {dataSaved &&
                            <Button
                                style={styles.button}
                                onPress={publishQuiz}
                            >
                                Publish
                            </Button>
                        }
                    </View>
                </View>
            }
            {!dataFetched && questions.length == 0 &&
                <Loading />
            }
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 24,
        color: '#8f959a'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listcontainer: {
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    textPrimary: {
        marginVertical: 20,
        textAlign: 'center',
        fontSize: 20,
    },
    textSecondary: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 17,
    },
    button: {
        marginTop: 10,
        width: 125
    }
});
