import { useContext, useEffect, useState } from "react";
import { Button, Icon, AirbnbRating, Tooltip, Divider } from '@rneui/themed';
import { StyleSheet, Text, View } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import AuthContext from "../context/AuthContext";


export default function PublishedQuiz({ route, navigation }) {
    const { quizId } = route.params;

    const [questions, setQuestions] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [quiz, setQuiz] = useState({
        quiz: null,
        rating: 0
    });

    const [tooltipOpen, setTooltipOpen] = useState(false);

    const { backEndUrl } = useContext(AuthContext);

    const fetchQuestions = () => {
        fetch(`${backEndUrl}/questions/${quizId}`)
            .then(response => response.json())
            .then(data => {
                setQuestions(data);
                setDataFetched(true);
            })
            .catch(error => console.error(error));
    }

    const fetchQuiz = () => {
        fetch(`${backEndUrl}/quizzes/${quizId}`)
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