import { Button, Icon, Overlay, Text, ListItem } from "@rneui/themed";
import { useState } from "react";
import { StyleSheet, FlatList, View } from "react-native";

export default function AnswersCreation({ item, index, questions, setQuestions, setDataSaved }) {
    const [currentQuestion, setCurrentQuestion] = useState({
        question: {
            questionId: -1,
            text: "",
            quiz: null,
            answers: []
        },
        index: -1
    });
    const [visible, setVisible] = useState(false);

    const toggleOverlay = () => {
        setVisible(!visible);
    }

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

    return (
        <View>
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
        </View>
    );
}

const styles = StyleSheet.create({
    textPrimary: {
        marginVertical: 20,
        textAlign: 'center',
        fontSize: 20,
    },
    textSecondary: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 17,
    }
});