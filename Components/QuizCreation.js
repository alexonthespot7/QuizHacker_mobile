import { useContext, useEffect, useState } from "react";
import { Input, Button, Icon } from '@rneui/themed';
import { StyleSheet, Text, View, Alert } from 'react-native';

import SelectDropdown from "react-native-select-dropdown";
import AuthContext from "../context/AuthContext";
import Loading from "./Loading";


export default function QuizCreation({ route, navigation }) {
    const { quizId } = route.params;

    const [quiz, setQuiz] = useState(null);
    const [dataFetched, setDataFetched] = useState(false);
    const [categories, setCategories] = useState([]);
    const [difficulties, setDifficulties] = useState([]);
    const [titleError, setTitleError] = useState(false);
    const [descriptionError, setDescriptionError] = useState(false);
    const [errorText, setErrorText] = useState('');

    const { loginData, backEndUrl, handleBadResponse, handleResponseWithData } = useContext(AuthContext);

    const handleQuizData = (data) => {
        const quizRating = data;
        setQuiz({
            ...quizRating.quiz,
            rating: quizRating.rating,
            user: quizRating.quiz.user.id,
            category: quizRating.quiz.category.categoryId,
            difficulty: quizRating.quiz.difficulty.difficultyId
        });
        fetchDifficulties();
    }

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`${backEndUrl}/quizzes/${quizId}`);
            if (!response.ok) {
                Alert.alert('Something went wrong');
                return null;
            }
            handleResponseWithData(response, handleQuizData);
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }

    const handleDifficultiesData = (data) => {
        setDifficulties(data);
        fetchCategories();
    }

    const fetchDifficulties = async () => {
        try {
            const response = await fetch(`${backEndUrl}/difficulties`);
            if (!response.ok) {
                Alert.alert('Something went wrong');
                return null;
            }
            handleResponseWithData(response, handleDifficultiesData);
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }

    const handleCategoriesData = (data) => {
        setCategories(data);
        setDataFetched(true);
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${backEndUrl}/categories`);
            if (!response.ok) {
                Alert.alert('Something went wrong');
                return null;
            }
            handleResponseWithData(response, handleCategoriesData);
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }

    useEffect(() => {
        setDataFetched(false);
        fetchQuiz();
        fetchDifficulties();
        fetchCategories();
    }, []);

    const sendQuiz = async () => {
        try {
            const response = await fetch(`${backEndUrl}/updatequiz/${quizId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loginData.jwt
                },
                body: JSON.stringify(quiz)
            });

            if (!response.ok) {
                handleBadResponse(response);
                return null;
            }
            Alert.alert('Data was saved successfully');
            setDataFetched(true);
        } catch (error) {
            Alert.alert('Something went wrong');
        }
    }

    const submit = () => {
        if (quiz.title === '') {
            setTitleError(true);
            setErrorText('Title cannot be empty');
        } else if (quiz.description === '') {
            setDescriptionError(true);
            setErrorText('Description cannot be empty');
        } else if (quiz.category === '') {
            Alert.alert('Choose category please');
        } else if (quiz.difficulty === '') {
            Alert.alert('Please choose difficulty');
        } else if (quiz.minutes === '' || quiz.minutes === 0) {
            Alert.alert('Please choose time frame');
        } else {
            setDataFetched(false);
            sendQuiz();
        }
    }

    const toQuestions = () => {
        navigation.navigate('QuestionsCreation', { quizId: quizId });
    }

    const findDifficultyObjectById = (id) => {
        for (let i = 0; i < difficulties.length; i++) {
            if (difficulties[i].difficultyId === id) return difficulties[i];
        }
    }

    const findCategoryObjectById = (id) => {
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].categoryId === id) return categories[i];
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{`Quiz №${quizId}`}</Text>
            {dataFetched && quiz &&
                <View style={{ flex: 1, gap: 20, marginHorizontal: '7%', marginTop: 5 }}>
                    <Input
                        placeholder='Title'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={titleError}
                        errorMessage={errorText}
                        onChangeText={title => setQuiz({ ...quiz, title: title })}
                        value={quiz.title}
                        containerStyle={{ width: 300 }}
                    />
                    <Input
                        containerStyle={{ width: 300 }}
                        placeholder='Description'
                        errorStyle={{ color: 'red' }}
                        renderErrorMessage={descriptionError}
                        errorMessage={errorText}
                        onChangeText={description => setQuiz({ ...quiz, description: description })}
                        value={quiz.description}
                    />
                    <Text style={styles.propertyTitle}>
                        Difficulty:
                    </Text>
                    <SelectDropdown
                        buttonStyle={{ width: 200, height: 40, borderRadius: 20 }}
                        data={difficulties}
                        onSelect={(selectedItem, index) => {
                            setQuiz({ ...quiz, difficulty: selectedItem.difficultyId });
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            return selectedItem.name;
                        }}
                        rowTextForSelection={(item, index) => {
                            return item.name;
                        }}
                        renderDropdownIcon={() => <Icon name='chevron-down' type='feather' />}
                        defaultValue={findDifficultyObjectById(quiz.difficulty)}
                    />
                    <Text style={styles.propertyTitle}>
                        Category:
                    </Text>
                    <SelectDropdown
                        buttonStyle={{ width: 200, height: 40, borderRadius: 20 }}
                        data={categories}
                        onSelect={(selectedItem, index) => {
                            setQuiz({ ...quiz, category: selectedItem.categoryId });
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            return selectedItem.name;
                        }}
                        rowTextForSelection={(item, index) => {
                            return item.name;
                        }}
                        renderDropdownIcon={() => <Icon name='chevron-down' type='feather' />}
                        defaultValue={findCategoryObjectById(quiz.category)}
                        search
                    />
                    <Text style={styles.propertyTitle}>
                        Timing:
                    </Text>
                    <SelectDropdown
                        buttonStyle={{ width: 200, height: 40, borderRadius: 20 }}
                        data={Array.from({ length: 20 }, (_, i) => i + 1)}
                        onSelect={(selectedItem, index) => {
                            setQuiz({ ...quiz, minutes: selectedItem });
                        }}
                        buttonTextAfterSelection={(selectedItem, index) => {
                            return selectedItem;
                        }}
                        rowTextForSelection={(item, index) => {
                            return item;
                        }}
                        renderDropdownIcon={() => <Icon name='chevron-down' type='feather' />}
                        defaultValue={quiz.minutes}
                    />
                    <View style={{ alignItems: 'center', marginTop: 30, flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Button
                            style={styles.button}
                            onPress={submit}
                        >
                            Save
                            <Icon style={{ marginLeft: 10 }} name='save' color='white' />
                        </Button>
                        <Button
                            style={styles.button}
                            onPress={toQuestions}
                        >
                            Questions
                            <Icon style={{ marginLeft: 5 }} name='edit' color='white' />
                        </Button>
                    </View>
                </View>
            }
            {!dataFetched && !quiz &&
                <Loading />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        gap: 5
    },
    listcontainer: {
        marginTop: 100
    },
    button: {
        marginTop: 10,
        width: 135,
    },
    propertyTitle: {
        marginBottom: -10,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b1b8be'
    },
    title: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 24,
        color: '#8f959a'
    },
});