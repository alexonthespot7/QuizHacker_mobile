import { useContext, useEffect, useState } from "react";
import { Button, Icon, AirbnbRating, Tooltip, Divider, ButtonGroup } from '@rneui/themed';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';

import AuthContext from "../context/AuthContext";

export default function QuizTaking({ route, navigation }) {
    const { quizId } = route.params;

    const [questions, setQuestions] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [quiz, setQuiz] = useState({
        quiz: null,
        rating: 0
    });
    const [start, setStart] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [isFinish, setIsFinish] = useState(false);
    const [rating, setRating] = useState(0);
    const [rated, setRated] = useState(false);
    const [score, setScore] = useState(0);

    const { loginData, setProcessStarted } = useContext(AuthContext);

    const fetchQuestions = () => {
        fetch('https://quiz-hacker-back.herokuapp.com/questions/' + quizId)
            .then(response => response.json())
            .then(data => {
                setQuestions(data);
                setDataFetched(true);
            })
            .catch(error => console.error(error));
    }

    const fetchQuiz = () => {
        fetch('https://quiz-hacker-back.herokuapp.com/quizzes/' + quizId)
            .then(response => response.json())
            .then(data => {
                setQuiz(data);
                fetchQuestions();
            })
            .catch(error => console.error(error));
    }

    useEffect(() => {
        fetchQuiz();
    }, []);

    const sendAttempt = (newAnswers) => {
        if (newAnswers.length < questions.length && selectedIndex !== -1) {
            newAnswers.push({
                questionId: questions[newAnswers.length].questionId,
                answerId: questions[newAnswers.length].answers[selectedIndex].answerId
            });
            setAnswers(newAnswers);
        }
        setStart(false);
        setIsFinish(true);
    }

    const handleAnswer = () => {
        if (selectedIndex !== -1) {
            setSelectedIndex(-1)
            const newAnswers = [...answers];
            newAnswers.push({
                questionId: questions[answers.length].questionId,
                answerId: questions[answers.length].answers[selectedIndex].answerId
            });
            setAnswers(newAnswers);
            if (newAnswers.length === questions.length) {
                sendAttempt(newAnswers);
            }
        } else {
            Alert.alert('Please select the answer first');
        }
    }

    const submitFetch = () => {
        setDataFetched(false);
        fetch('https://quiz-hacker-back.herokuapp.com/sendattempt/' + quizId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loginData.jwt
            },
            body: JSON.stringify({ attemptAnswers: answers, rating: rating })
        })
            .then(response => {
                if (response.ok) {
                    setScore(response.headers.get('Host'));
                    setDataFetched(true);
                    setRated(true);
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

    const submitAll = () => {
        if (rating === 0) {
            Alert.alert('Please rate the quiz first');
        } else {
            submitFetch();
        }
    }

    const finishAll = () => {
        navigation.navigate('Quizzes');
    }

    return (
        <View style={styles.container}>
            {dataFetched && quiz && questions.length > 0 && <View style={{ flex: 1 }}>
                <Text style={styles.title}>
                    {`${quiz.quiz.title}`}
                </Text>
                <AirbnbRating
                    isDisabled={true}
                    defaultRating={quiz.rating === null ? 0 : quiz.rating}
                    showRating={false}
                    size={30}
                />
                <View style={styles.propertyRowContainer}>
                    <View style={styles.propertyContainer}>
                        <Text style={styles.propertyTitle}>Description:</Text>
                        <Tooltip
                            visible={tooltipOpen}
                            onOpen={() => {
                                setTooltipOpen(true);
                            }}
                            onClose={() => {
                                setTooltipOpen(false);
                            }}
                            containerStyle={{ width: 160, height: 150 }}
                            popover={
                                <Text>
                                    {
                                        quiz.quiz.description
                                    }
                                </Text>
                            }
                        >
                            <Text style={styles.propertyValue}>Read <Icon name='book' type='feather' /></Text>
                        </Tooltip>
                    </View>
                    <View style={styles.propertyContainer}>
                        <Text style={styles.propertyTitle}>Difficulty:</Text>
                        <Text style={styles.propertyValue}>{quiz.quiz.difficulty.name}</Text>
                    </View>
                </View>
                <View style={{ ...styles.propertyRowContainer, marginBottom: 20 }}>
                    <CountdownCircleTimer
                        isPlaying={start}
                        duration={quiz.quiz.minutes * 60}
                        size={100}
                        colors={['#899656', '#F7B801', '#A30000']}
                        colorsTime={[quiz.quiz.minutes * 40 - 1, quiz.quiz.minutes * 15 - 1, 0]}
                        onComplete={() => sendAttempt(answers)}
                    >
                        {({ remainingTime }) =>
                            <View style={{ alignItems: 'center' }}>
                                {remainingTime >= 60 && <Text>{`${Math.floor(remainingTime / 60)} min`}</Text>}
                                {start && <Text> {`${remainingTime % 60} sec`}</Text>}
                            </View>
                        }
                    </CountdownCircleTimer>
                    <View style={styles.propertyContainer}>
                        <Text style={styles.propertyTitle}>
                            {start ? 'Remaining:' : 'Questions:'}
                        </Text>
                        <Text style={styles.propertyValue}>
                            {!isFinish ? questions.length - answers.length : questions.length}
                        </Text>
                    </View>
                </View>
                <Divider />
                {!start && !isFinish && <View style={{ alignItems: 'center', marginTop: 80 }}>
                    <Button
                        style={{ width: 150 }}
                        onPress={() => {
                            setProcessStarted(true);
                            setStart(true);
                        }}
                    >
                        Start
                    </Button>
                </View>}
                {start && answers.length < questions.length &&
                    <View style={{ alignItems: 'center', gap: 10, marginTop: 10, flex: 0.8, marginHorizontal: '5%' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#b1b8be' }}>
                            {`Question ${answers.length + 1}:`}
                        </Text>
                        <Text style={{ fontSize: 18 }}>{questions[answers.length].text}</Text>
                        <ButtonGroup
                            containerStyle={{ height: 60, marginTop: 20, marginBottom: 20 }}
                            buttons={(questions[answers.length].answers).map(obj => obj.text)}
                            selectedIndex={selectedIndex}
                            onPress={(value) => {
                                setSelectedIndex(value);
                            }}
                        />
                        <Button
                            style={{}}
                            onPress={handleAnswer}
                        >
                            {answers.length === questions.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                    </View>
                }
                {isFinish && !rated &&
                    < View style={{ gap: 20, marginHorizontal: 40, marginTop: 10 }}>
                        <Text style={{ ...styles.propertyValue, fontSize: 22, textAlign: 'center' }}>
                            Rate the quiz to get the results:
                        </Text>
                        <AirbnbRating
                            defaultRating={rating}
                            showRating={false}
                            size={32}
                            onFinishRating={(rate) => setRating(rate)}
                        />
                        <Text style={{ ...styles.propertyValue, textAlign: 'center', marginTop: -10, fontSize: 22 }}>
                            {`${rating}/5`}
                        </Text>
                        <View style={{ alignItems: 'center' }}>
                            <Button style={{ width: 200 }} onPress={submitAll}>
                                Submit
                            </Button>
                        </View>
                    </View>
                }
                {isFinish && rated &&
                    <View style={{ gap: 20, marginHorizontal: 40, flex: 1 }}>
                        <Text style={styles.title} >
                            Results
                        </Text>
                        <View style={styles.resultsRow}>
                            <Text style={styles.propertyTitle}>
                                Score:
                            </Text>
                            <Text style={styles.propertyValue}>
                                {`${score}/${questions.length}`}
                            </Text>
                        </View>
                        <View style={styles.resultsRow}>
                            <Text style={styles.propertyTitle}>
                                Difficulty rate:
                            </Text>
                            <Text style={styles.propertyValue}>
                                {quiz.quiz.difficulty.rate}
                            </Text>
                        </View>
                        <View style={styles.resultsRow}>
                            <Text style={styles.propertyTitle}>
                                Total score:
                            </Text>
                            <Text style={{ ...styles.propertyValue, color: '#899656', fontWeight: 'bold', fontSize: 24 }}>
                                {(score * quiz.quiz.difficulty.rate).toFixed(2)}
                            </Text>
                        </View>
                        <Divider />
                        <Text style={{ ...styles.propertyValue, fontSize: 22, textAlign: 'center' }}>
                            You rate this quiz:
                        </Text>
                        <AirbnbRating
                            defaultRating={rating}
                            showRating={false}
                            size={32}
                            isDisabled
                        />
                        <Text style={{ ...styles.propertyValue, textAlign: 'center', marginTop: -10, fontSize: 22 }}>
                            {`${rating}/5`}
                        </Text>
                        <View style={{ alignItems: 'center' }}>
                            <Button style={{ width: 200 }} onPress={finishAll}>
                                Finish
                            </Button>
                        </View>
                    </View>
                }
            </View>}
            {(!dataFetched || !quiz || !(questions.length > 0)) && <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <Button title="Solid" type="solid" loading style={{ borderRadius: 25, width: 80, height: 80 }} />
            </View>}
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 24,
        color: '#8f959a'
    },
    propertyContainer: {
        alignItems: 'center',
        gap: 8
    },
    propertyRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flex: 0.2
    },
    propertyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b1b8be'
    },
    propertyValue: {
        fontSize: 20
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
    resultsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});