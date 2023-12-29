import './App.css';
import LibraryProvider from './providers/LibraryProvider';
import Container from './components/Container';

function App() {
  return (
    <>
      <LibraryProvider>
        <Container />
      </LibraryProvider>
    </>
  );
}

export default App;
