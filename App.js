import Main from './Components/Main';
import ContextProvider from './context/ContextProvider';

export default function App() {

  return (
    <ContextProvider>
      <Main />
    </ContextProvider>
  );
}