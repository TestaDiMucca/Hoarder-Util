import './App.css';
import LoadLibrary from './components/LoadLibrary';
import LibraryProvider from './providers/LibraryProvider';

function App() {
  return (
    <>
      <LibraryProvider>
        <LoadLibrary />
      </LibraryProvider>
    </>
  );
}

export default App;
