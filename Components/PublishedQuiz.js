import { useContext, useEffect, useState } from "react";
import { Button, Icon, AirbnbRating, Tooltip, Divider } from '@rneui/themed';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import AuthContext from "../context/AuthContext";
import Loading from "./Loading";

const initialQuiz = {
    quiz: null,
    rating: 0
}

export default function PublishedQuiz({ route }) {
    const { quizId } = route.params;

    const [questions, setQuestions] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [quiz, setQuiz] = useState(initialQuiz);

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const { backEndUrl, handleResponseWithData } = useContext(AuthContext);

    const handleQuestionsData = (data) => {
        setQuestions(data);
        setDataFetched(true);
    }

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${backEndUrl}/questions/${quizId}`);
            if (!response.ok) {
                Alert.alert('Something was wrong, try again later');
                return null;
            }
            handleResponseWithData(response, handleQuestionsData);
        } catch (error) {
            Alert.alert('Something is wrong with the server');
        }
    }

    const handleQuizData = (data) => {
        setQuiz(data);
        fetchQuestions();
    }

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`${backEndUrl}/quizzes/${quizId}`);
            if (!response.ok) {
                Alert.alert('Something is wrong with the server');
                return null;
            }
            handleResponseWithData(response, handleQuizData);
        } catch (error) {
            Alert.alert('Something is wrong with the server');
        }
    }

    useEffect(() => {
        fetchQuiz();
    }, []);

    return (
        <View style={styles.container}>
            {dataFetched &&
                <View style={{ flex: 1 }}>
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
                                onOpen={() => setTooltipOpen(true)}
                                onClose={() => setTooltipOpen(false)}
                                containerStyle={{ width: 160, height: 150 }}
                                popover={
                                    <Text>
                                        {quiz.quiz.description}
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
                            isPlaying={false}
                            duration={quiz.quiz.minutes * 60}
                            size={120}
                            colors={['#899656', '#F7B801', '#A30000']}
                            colorsTime={[quiz.quiz.minutes * 40 - 1, quiz.quiz.minutes * 15 - 1, 0]}
                        >
                            {({ remainingTime }) =>
                                <View style={{ alignItems: 'center' }}>
                                    {remainingTime >= 60 && <Text style={{ fontSize: 18 }}>{`${Math.floor(remainingTime / 60)} min`}</Text>}
                                </View>
                            }
                        </CountdownCircleTimer>
                        <View style={styles.propertyContainer}>
                            <Text style={styles.propertyTitle}>
                                Questions:
                            </Text>
                            <Text style={styles.propertyValue}>
                                {questions.length}
                            </Text>
                        </View>
                    </View>
                    <Divider />
                    <View style={{ alignItems: 'center', marginTop: 80, gap: 10 }}>
                        <Text style={{ ...styles.propertyTitle, fontSize: 30 }}>
                            Status:
                        </Text>
                        <Text style={{ ...styles.propertyValue, fontSize: 28 }}>
                            {quiz.quiz.status}
                        </Text>
                    </View>
                </View>
            }
            {!dataFetched &&
                <Loading />
            }
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
        flex: 0.25
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