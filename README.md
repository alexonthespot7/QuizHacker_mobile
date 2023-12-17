# QuizHacker_mobile
> React Native Expo project which implements front-end side as mobile application for QuizHacker project with creating, taking quizzes functionalities.<br>
>
> The back-end side of the application can be found [here](https://github.com/alexonthespot7/QuizHacker_back-end)

## Table of Contents
* [Usage Guide](#usage-guide)
* [Features](#features)
* [Technologies](#technologies)
* [Screenshots](#screenshots)
* [Demo Video](#demo-video)
* [License](#license)

## Usage Guide
1. Install Expo Go on your device:
    - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) - Android Lollipop (5) and greater
    - [iOS App Store](https://apps.apple.com/us/app/expo-go/id982107779) - iOS 13 and greater<br>
2. Clone the project <br>```git clone https://github.com/alexonthespot7/QuizHackerMobile.git```<br>
3. Run the following command in a terminal window in the complete directory:<br>
```npx expo start```<br>
4. Scan the created QR-code to open the project in the Expo Go app<br>
(make sure that your mobile device is connected to the same network as the pc where you are running the expo app)

## Features
### Leaderboard Display:
  - Users view the top 10 rankings.
  - Authenticated users who have taken at least one quiz are displayed on the leaderboard with their position.

### Personal Page:
  - Display user information: email, username, score, position in the leaderboard, attempts quantity, and average score among attempts.

### Personal Quizzes:
  - View list of created quizzes.
  - Edit existing quizzes.
  - Details include title, description, question count, rating by other users, time limit, category, and difficulty.

### Creating/Editing Quizzes:
  - Create quizzes with title, description, time limit, category, and difficulty.
  - Edit questions and answers; each question has four answers, with one correct.

### List of Unattempted Quizzes:
  - Display quizzes created by other users that the current user hasn't taken.

### Quiz Taking Process:
  - Time-limited quiz answering.
  - Display questions and choices for users to select answers.
  - Rate quizzes from 1 to 5 stars after completion.
  - View score (questions answered * quiz difficulty: easy - 1, medium - 2, hard - 3).

### Profile Avatar:
  - Capture and set a profile photo.
  - Store profile photos in Firebase storage.

### Authentication:
  - Users can register and log in to the application.

## Technologies
### React Navigation:
A library that provides navigation solutions for React Native apps, allowing you to easily navigate between screens and manage app state.

### AsyncStorage:
A simple, asynchronous, persistent, key-value storage system for React Native, used for storing and retrieving data in your app.

### React Native Safe Area Context:
A library that provides a safe area context for React Native apps, ensuring that your app's content is always visible and correctly positioned on different device screens.

### React Native Elements:
A library of cross-platform UI components for React Native apps, including buttons, icons, forms, and more.

### Context API
A feature in React that allows you to share data between components without the need for props drilling. It provides a way to manage global state in your application.

### CountdownCircleTimer
A React Native component that provides a countdown timer with a circular progress indicator.

### Rest API
In the QuizHacker project, the REST API is used to fetch data from the server. The fetch() function is used to make HTTP requests to the server and retrieve JSON data in response.

### Vibration API
This API allows web developers to access the vibration hardware of a device and trigger vibration patterns. In my case, the Vibration API is used to trigger a short vibration when the quiz process begins to provide feedback to the user and enhance their experience.

### Expo Camera
A library that provides a React component that renders a native camera view. In my project used to take photos for users' avatars.

### Firebase Storage
A cloud-based storage service that lets you store and retrieve user-generated content like photos, videos, and audio files. It provides a simple API for uploading and downloading files, and it integrates well with other Firebase services. In my project is used to store photos of the users.

## Screenshots
![imgonline-com-ua-twotoone-aSgKbJUK6An](https://github.com/alexonthespot7/QuizHackerMobile/assets/90186057/0b92847a-dbea-4679-b9da-8c16797c1774)

## Demo Video
https://github.com/alexonthespot7/QuizHackerMobile/assets/90186057/41948745-502c-432a-b2c3-779b263eaf20

## License
This project is under the MIT License.
