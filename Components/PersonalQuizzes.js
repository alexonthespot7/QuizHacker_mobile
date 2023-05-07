import { useFocusEffect } from '@react-navigation/native';
import { Button, Text, Icon, ListItem, SearchBar, Badge, Overlay, AirbnbRating, Tooltip } from '@rneui/themed';
import { useCallback, useContext, useState } from 'react';

import { StyleSheet, View, FlatList, Alert } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import AuthContext from '../context/AuthContext';

export default function PersonalQuizzes({ navigation }) {
    const [quizzes, setQuizzes] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(new Array(quizzes.length).fill(false));
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState(0);
    const [filterConditions, setFilterConditions] = useState({
        difficulty: 'No Filter',
        category: 'No Filter',
        rating: 0,
    });
    const [tempConditions, setTempConditions] = useState({
        difficulty: 'No Filter',
        category: 'No Filter',
        rating: 0,
    });
    const [filterOverlay, setFilterOverlay] = useState(false);
    const [categories, setCategories] = useState([]);

    const { loginData } = useContext(AuthContext);

    const filteredQuizzes = quizzes.filter(
        quiz => {
            return (
                (quiz.quiz.title.toLowerCase().includes(search.toLowerCase()) ||
                    quiz.quiz.category.name.toLowerCase().includes(search.toLowerCase()) ||
                    (quiz.quiz.description !== null && quiz.quiz.description.toLowerCase().includes(search.toLowerCase())) ||
                    quiz.quiz.difficulty.name.toLowerCase().includes(search.toLowerCase()) ||
                    quiz.quiz.minutes.toString().includes(search)) && (
                    (quiz.quiz.difficulty.name.toLowerCase().includes(filterConditions.difficulty.toLocaleLowerCase()) || filterConditions.difficulty === 'No Filter') &&
                    (quiz.quiz.category.name.toLowerCase().includes(filterConditions.category.toLowerCase()) || filterConditions.category === 'No Filter') &&
                    (filterConditions.rating === 0 || quiz.rating > filterConditions.rating - 1 && quiz.rating <= filterConditions.rating)
                )
            );
        }
    );

    const fetchCategories = () => {
        fetch('https://quiz-hacker-back.herokuapp.com/categories')
            .then(response => response.json())
            .then(data => {
                const cats = data;
                cats.unshift({
                    "categoryId": -1,
                    "name": "No Filter"
                });
                setCategories(cats);
                setDataFetched(true);
            })
            .catch(err => console.error(err));
    }

    const fetchQuizzes = () => {
        fetch('https://quiz-hacker-back.herokuapp.com/personalquizzes/' + loginData.id,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': loginData.jwt
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setQuizzes(data);
                    setTooltipOpen(new Array(data.length).fill(false))
                    fetchCategories();
                } else {
                    Alert.alert('Please re-login');
                }
            })
            .catch(err => console.error(err));
    }

    useFocusEffect(
        useCallback(() => {
            fetchQuizzes();
        }, [loginData])
    );

    const openTooltip = (index) => {
        const newTooltip = new Array(quizzes.length).fill(false);
        newTooltip[index] = true;
        setTooltipOpen(newTooltip);
    }

    const closeTooltip = () => {
        const newTooltip = new Array(quizzes.length).fill(false);
        setTooltipOpen(newTooltip);
    }

    const toggleOverlay = () => {
        setFilterOverlay(!filterOverlay);
    }

    const applyFilters = () => {
        let count = 0;
        if (tempConditions.category !== 'No Filter') {
            count++;
        }
        if (tempConditions.difficulty !== 'No Filter') {
            count++;
        }
        if (tempConditions.rating !== 0) {
            count++;
        }
        setFiltered(count);
        setFilterConditions(tempConditions);
        setFilterOverlay(false);
    }

    const resetFilters = (flag) => {
        setFiltered(0);
        setTempConditions({
            difficulty: 'No Filter',
            category: 'No Filter',
            rating: 0,
        });
        setFilterConditions({
            difficulty: 'No Filter',
            category: 'No Filter',
            rating: 0,
        });
        setFilterOverlay(flag);
    }

    const createQuiz = () => {
        setDataFetched(false);
        fetch('https://quiz-hacker-back.herokuapp.com/createquiz', {
            method: 'GET',
            headers: {
                'Authorization': loginData.jwt
            }
        })
            .then(response => {
                if (response.ok) {
                    const newQuizId = response.headers.get('Host');
                    setDataFetched(true);
                    navigation.navigate('QuizCreation', { quizId: newQuizId });
                } else if (response.status === 401) {
                    Alert.alert('Please re-login');
                } else {
                    setProgress(false);
                    Alert.alert('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    const deleteItem = (quizId) => {
        console.log(quizId);
        fetch('https://quiz-hacker-back.herokuapp.com/deletequiz/' + quizId, {
            method: 'DELETE',
            headers: {
                'Authorization': loginData.jwt
            },
        })
            .then(response => {
                if (response.ok) {
                    setDataFetched(false);
                    fetchQuizzes();
                    Alert.alert('Quiz was deleted successfully');
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

    const navigateToQuiz = (status, id) => {
        if (status !== 'Published') {
            navigation.navigate('QuizCreation', { quizId: id });
        } else {
            navigation.navigate('MyPublishedQuiz', { quizId: id });
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                My Quizzes
            </Text>
            {quizzes.length > 0 && dataFetched && <View style={{ flex: 0.92 }}>
                <View style={{ flexDirection: 'row', marginHorizontal: '5%', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                    <SearchBar
                        containerStyle={{ width: '80%' }}
                        inputContainerStyle={{ height: 35 }}
                        lightTheme
                        placeholder="Search quizzes..."
                        onChangeText={(search) => setSearch(search)}
                        value={search}
                    />
                    <View>
                        <Icon
                            onPress={() => resetFilters(true)}
                            name='filter'
                            type={filtered > 0 ? 'font-awesome' : 'feather'}
                            size={filtered > 0 ? 30 : 28}
                        />
                        {filtered > 0 && <Badge
                            status="primary"
                            value={filtered}
                            containerStyle={{ position: 'absolute', top: -6.5, left: 15 }}
                            onPress={() => resetFilters(true)}
                        />}
                    </View>
                </View>
                <FlatList
                    style={{ marginLeft: "5%", marginTop: 10 }}
                    renderItem={({ item, index }) =>
                        <ListItem.Swipeable
                            bottomDivider
                            rightContent={() => (
                                <Button
                                    containerStyle={{
                                        flex: 1,
                                        backgroundColor: '#f4f4f4',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    type="clear"
                                    icon={{ name: 'delete-outline', size: 40 }}
                                    onPress={() => {
                                        if (item.quiz.status !== 'Published') { deleteItem(item.quiz.quizId) } else { Alert.alert('You cannot delete published quiz') }
                                    }}
                                />
                            )}
                        >
                            <ListItem.Content style={{ gap: 12 }}>
                                <ListItem.Title style={{ fontSize: 22, fontWeight: 'bold', color: '#b1b8be', marginBottom: -8 }}>{item.quiz.title}</ListItem.Title>
                                <Tooltip
                                    visible={tooltipOpen[index]}
                                    onOpen={() => openTooltip(index)}
                                    onClose={closeTooltip}
                                    containerStyle={{ width: 160, height: 150 }}
                                    popover={
                                        <Text>
                                            {
                                                item.quiz.description
                                            }
                                        </Text>
                                    }
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.value}>Description </Text>
                                        <Icon name='info' type='feather' size={18} />
                                    </View>
                                </Tooltip>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.subtitle}>Category: </Text>
                                    <Text style={styles.value}>{`${item.quiz.category.name}`}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.subtitle}>Difficulty: </Text>
                                    <Text style={styles.value}>{item.quiz.difficulty.name}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.subtitle}>Questions: </Text>
                                    <Text style={styles.value}>{`${item.questions}`}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.subtitle}>Time: </Text>
                                    <Text style={styles.value}>{`${item.quiz.minutes} min`}</Text>
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.subtitle}>Rating: </Text>
                                    <Text style={styles.value}>{`${item.rating ? item.rating : 0}/5`}</Text>
                                </View>
                            </ListItem.Content>
                            <ListItem.Chevron size={40} onPress={() => navigateToQuiz(item.quiz.status, item.quiz.quizId)} />
                        </ListItem.Swipeable>
                    }
                    keyExtractor={item => item.quiz.quizId}
                    data={filteredQuizzes}
                />
                <Overlay isVisible={filterOverlay} onBackdropPress={toggleOverlay} overlayStyle={{ flex: 0.5, width: '90%' }}>
                    <Text style={styles.textPrimary}>
                        Filter
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: '2%', marginTop: 10 }}>
                        <View style={{ gap: 10 }}>
                            <Text style={styles.propertyTitle}>
                                Difficulty:
                            </Text>
                            <SelectDropdown
                                buttonStyle={{ width: 150, height: 40, borderRadius: 20 }}
                                data={['No Filter', 'Easy', 'Medium', 'Hard']}
                                onSelect={(selectedItem, index) => {
                                    setTempConditions({ ...tempConditions, difficulty: selectedItem });
                                }}
                                buttonTextAfterSelection={(selectedItem, index) => {
                                    return selectedItem;
                                }}
                                rowTextForSelection={(item, index) => {
                                    return item;
                                }}
                                renderDropdownIcon={() => <Icon name='chevron-down' type='feather' />}
                                defaultValue='No Filter'
                            />
                        </View>
                        <View style={{ gap: 10 }}>
                            <Text style={styles.propertyTitle}>
                                Rating:
                            </Text>
                            <AirbnbRating
                                defaultRating={tempConditions.rating}
                                showRating={false}
                                size={22}
                                onFinishRating={(rate) => setTempConditions({ ...tempConditions, rating: rate })}
                            />
                        </View>
                    </View>
                    <View style={{ marginTop: 30, gap: 10, alignItems: 'center' }}>
                        <Text style={styles.propertyTitle}>
                            Category:
                        </Text>
                        <SelectDropdown
                            buttonStyle={{ width: 250, height: 40, borderRadius: 20 }}
                            data={categories}
                            onSelect={(selectedItem, index) => {
                                setTempConditions({ ...tempConditions, category: selectedItem.name });
                            }}
                            buttonTextAfterSelection={(selectedItem, index) => {
                                return selectedItem.name;
                            }}
                            rowTextForSelection={(item, index) => {
                                return item.name;
                            }}
                            renderDropdownIcon={() => <Icon name='chevron-down' type='feather' />}
                            defaultValue={categories[0]}
                            search
                        />
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: '20%', justifyContent: 'space-between', marginHorizontal: '15%' }}>
                        <Button
                            onPress={applyFilters}
                        >
                            Apply
                            <Icon style={{ marginLeft: 8 }} name='check-circle' type='feather' color='white' size={22} />
                        </Button>
                        <Button
                            color={'secondary'}
                            onPress={() => resetFilters(false)}
                        >
                            Cancel
                            <Icon style={{ marginLeft: 8 }} name='x-circle' type='feather' color='white' size={22} />
                        </Button>
                    </View>
                </Overlay>
            </View>}
            {quizzes.length === 0 && dataFetched &&
                <Text style={styles.textPrimary}>
                    You have no quizzes so far!
                </Text>}
            {dataFetched &&
                <View style={{ alignItems: 'center', marginTop: 30 }}>
                    <Button
                        style={{ width: 200 }}
                        onPress={createQuiz}
                    >
                        <Icon name='add' color='white' />
                        Quiz
                    </Button>
                </View>}
            {!dataFetched && <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                <Button title="Solid" type="solid" loading style={{ borderRadius: 25, width: 80, height: 80 }} />
            </View>}
        </View>
    );
}

const styles = StyleSheet.create({
    subtitle: {
        fontSize: 18,
        color: '#b1b8be'
    },
    value: {
        fontSize: 18
    },
    infoContainer: {
        flexDirection: 'row'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 24,
        color: '#8f959a'
    },
    propertyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#b1b8be'
    },
    textPrimary: {
        marginVertical: 20,
        textAlign: 'center',
        fontSize: 20,
    },
});