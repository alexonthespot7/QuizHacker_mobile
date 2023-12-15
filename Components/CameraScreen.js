import React, { useState, useEffect, useContext } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { Overlay, Button, Icon } from '@rneui/themed';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import { v4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/firebase';
import AuthContext from '../context/AuthContext';

export default function CameraScreen() {
    const [hasPermission, setHasPermission] = useState(null);
    const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
    const [photo, setPhoto] = useState(null);
    const [camera, setCamera] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [flash, setFlash] = useState(false);

    const { loginData, avatarURL, setAvatarURL } = useContext(AuthContext);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (camera) {
            const photoData = await camera.takePictureAsync({ quality: 0.5 });
            setPhoto(photoData);
        }
    }

    const flipCamera = () => {
        setCameraType(cameraType === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back);
    }

    if (hasPermission === null) {
        return <View />;
    }
    if (hasPermission === false) {
        return <View />;
    }

    const toggleOverlay = () => {
        setIsVisible(false);
    }

    const handleCapturePressIn = () => {
        setFlash(true);
    }

    const handleCapturePressOut = () => {
        setFlash(false);
    }

    const uploadUR = (downloadURL) => {
        fetch(`${process.env.REACT_APP_API_URL}/updateavatar/${loginData.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': loginData.jwt
            },
            body: downloadURL
        })
            .then(response => {
                if (response.ok) {
                    setAvatarURL(downloadURL);
                    setIsVisible(false);
                    setPhoto(null);
                    Alert.alert('Your profile avatar photo was updated successfully');
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


    const publishPhoto = async () => {
        if (!photo) {
            Alert.alert('Something is wrong. Please try again later');
            return;
        }

        try {
            if (avatarURL) {
                try {
                    const avatarRef = ref(storage, avatarURL);
                    await deleteObject(avatarRef);
                } catch (error) {
                    console.error(error);
                }
            }
            const photoRef = ref(storage, `images/${v4()}`);
            const response = await fetch(photo.uri);
            const blob = await response.blob();
            await uploadBytes(photoRef, blob);
            const downloadURL = await getDownloadURL(photoRef);

            uploadUR(downloadURL);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <View>
            <Button color='#e6f7ff' titleStyle={{ color: '#4183d1', width: 100 }} onPress={() => setIsVisible(true)}>
                <Icon name='camera' type='font-awesome-5' color='#4183d1' />
                Photo
            </Button>
            <Overlay isVisible={isVisible} onBackdropPress={toggleOverlay} overlayStyle={{ height: 300, width: 300, borderRadius: 500, position: 'absolute', top: '30%' }}>
                {!photo && <View>
                    <Camera style={styles.camera} type={cameraType} ref={(ref) => setCamera(ref)}>
                    </Camera>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.flipButton} onPress={() => flipCamera()}>
                            <Icon name="flip-camera-ios" type='material' size={40} color="white" />
                        </TouchableOpacity>
                        <TouchableWithoutFeedback onPressIn={() => handleCapturePressIn()} onPressOut={() => handleCapturePressOut()} onPress={() => takePicture()}>
                            <View style={[styles.captureButton, flash && styles.flashButton]} >
                            </View>
                        </TouchableWithoutFeedback>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => toggleOverlay()}>
                            <Icon name="cancel" type='material' size={40} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>}
                {photo && <View>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginTop: 15, marginHorizontal: 5 }}>
                        <TouchableOpacity onPress={publishPhoto}>
                            <Icon style={{ borderRadius: 100 }} name="check" type='materail-community' backgroundColor='#e6f7ff' size={40} color="green" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPhoto(null)}>
                            <Icon style={{ borderRadius: 100 }} name="x" backgroundColor='#e6f7ff' type='feather' size={40} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>}
            </Overlay>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: '-40%',
        left: '39.5%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    camera: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 140,
        overflow: 'hidden'
    },
    photo: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 140,
    },
    flipButton: {
        backgroundColor: 'transparent',
        position: 'absolute',
        left: '-175%',
        top: -5
    },
    flashButton: {
        backgroundColor: '#fff',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        position: 'absolute',
        right: '-175%',
        top: -5
    },
    captureButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderColor: '#fff',
        borderWidth: 2,
        marginBottom: 15,
    },
});