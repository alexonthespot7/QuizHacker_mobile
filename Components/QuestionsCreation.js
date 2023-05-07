import { useContext, useEffect, useState } from "react";
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { Text, Button, Icon, ListItem, Overlay } from '@rneui/themed';
import AuthContext from "../context/AuthContext";

export default function QuestionsCreation({ route, navigation }) {
    const { quizId } = route.params;

    const [questions, setQuestions] = useState([]);
    const [dataFetched, setDataFetched] = useState(true);
    const [visible, setVisible] = useState(false);
    const [dataSaved, setDataSaved] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({
        question: {
            questionId: -1,
            text: "",
            quiz: null,
            answers: []
        },
        index: -1
    });

    const { loginData } = useContext(AuthContext);

    const fetchQuestions = () => {
        fetch('https://quiz-hacker-back.herokuapp.com/questions/' + quizId, {
            headers: {
                'Authorization': loginData.jwt
            }
        })
            .then(response => response.json())
            .then(data => {
                setQuestions(data);
                setDataFetched(true);
            })
            .catch(error => console.error(error));
    }

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchDeleteQuestion = (questionId, index) => {
        fetch('https://quiz-hacker-back.herokuapp.com/deletequestion/' + questionId, {
            method: 'DELETE',
            headers: {
                'Authorization': loginData.jwt
            },
        })
            .then(response => {
                if (response.ok) {
                    const newQuestions = [...questions];
                    newQuestions.splice(index, 1);
                    setQuestions(newQuestions);
                } else if (response.status === 400) {
                    Alert.alert('Please try again later');
                } else if (response.status === 401) {
                    Alert.alert('Please re-login to prove your identity');
                } else {
                    Alert.alert('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    const changeQuestionText = (text, index) => {
        setDataSaved(false);
        const newQuestions = [...questions];
        newQuestions[index].text = text;
        setQuestions(newQuestions);
    }

    const toggleOverlay = () => {
        setVisible(!visible);
    };

    const saveAnswers = () => {
        setDataSaved(false);
        const newQuestions = [...questions];
        newQuestions[currentQuestion.index].answers = currentQuestion.question.answers;
        setQuestions(newQuestions);
        toggleOverlay();
    }

    const openAnswersOverlay = (question, index) => {
        setCurrentQuestion({
            question: question,
            index: index
        });
        toggleOverlay();
    }

    const changeAnswerText = (text, index) => {
        const currentAnswers = [...currentQuestion.question.answers];
        currentAnswers[index].text = text;
        setCurrentQuestion({ ...currentQuestion, question: { ...currentQuestion.question, answers: currentAnswers } });
    }

    const changeCorrect = (index) => {
        const currentAnswers = [...currentQuestion.question.answers];
        currentAnswers.map(item => item.correct = false);
        currentAnswers[index].correct = true;
        setCurrentQuestion({ ...currentQuestion, question: { ...currentQuestion.question, answers: currentAnswers } });
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
        fetchDeleteQuestion(questionId, index);
    }

    const saveAll = () => {
        setDataFetched(false);
        fetch('https://quiz-hacker-back.herokuapp.com/savequestions/' + questions[0].quiz.quizId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loginData.jwt
            },
            body: JSON.stringify(questions)
        })
            .then(response => {
                if (response.ok) {
                    setDataFetched(true);
                    setDataSaved(true);
                } else if (response.status === 401) {
                    setDataFetched(true);
                    Alert.alert('Please re-login to prove your identity');
                } else {
                    setDataFetched(true);
                    Alert.alert('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    const publishQuiz = () => {
        setDataFetched(false);
        fetch('https://quiz-hacker-back.herokuapp.com/publishquiz/' + questions[0].quiz.quizId, {
            method: 'POST',
            headers: {
                'Authorization': loginData.jwt
            }
        })
            .then(response => {
                if (response.ok) {
                    setDataFetched(true);
                    navigation.navigate('My Quizzes');
                } else if (response.status === 401) {
                    setDataFetched(true);
                    Alert.alert('Please re-login to prove your identity');
                } else {
                    setDataFetched(true);
                    Alert.alert('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    return (
        <View style={styles.container}>
            {dataFetched && questions[0] && <View style={{ flex: 0.9 }}>
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
                                <Button
                                    size='sm'
                                    icon={
                                        <Icon
                                            name="check"
                                            type="font-awesome"
                                            color="white"
                                            size={14}
                                            iconStyle={{ marginRight: 5 }}
                                        />
                                    }
                                    title="Answers"
                                    onPress={() => openAnswersOverlay(item, index)}
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
                <Overlay isVisible={visible} onBackdropPress={toggleOverlay} overlayStyle={{ flex: 0.7, width: '90%' }}>
                    <Text style={styles.textPrimary}>Edit answers:</Text>
                    <Text style={styles.textSecondary}>
                        {currentQuestion.question.text}
                    </Text>
                    <FlatList
                        style={{ marginLeft: "5%" }}
                        renderItem={({ item, index }) =>
                            <ListItem key={index} bottomDivider>
                                <ListItem.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ListItem.Input
                                        leftIcon={<Icon name="edit" />}
                                        textAlign='left'
                                        label={`Answer ${index + 1}`}
                                        placeholder="Answer"
                                        onChangeText={text => changeAnswerText(text, index)}
                                        value={item.text}
                                    />
                                    <ListItem.CheckBox
                                        checked={item.correct}
                                        onPress={() => changeCorrect(index)}
                                        checkedIcon="dot-circle-o"
                                        checkedColor="green"
                                        uncheckedIcon="circle-o"
                                    />
                                </ListItem.Content>
                            </ListItem>
                        }
                        keyExtractor={item => item.answerId}
                        data={currentQuestion.question.answers}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Button
                            icon={
                                <Icon
                                    name="save"
                                    type="font-awesome"
                                    color="white"
                                    size={18}
                                    iconStyle={{ marginRight: 7 }}
                                />
                            }
                            title="Save"
                            onPress={saveAnswers}
                        />
                        <Button
                            onPress={toggleOverlay}
                        >
                            <Icon size={18} name="cancel" color="white" style={{ marginRight: 5 }} />
                            Cancel
                        </Button>
                    </View>
                </Overlay>
            </View>}
            {!dataFetched && <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <Button title="Solid" type="solid" loading style={{ borderRadius: 25, width: 80, height: 80 }} />
            </View>}
        </View>
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
