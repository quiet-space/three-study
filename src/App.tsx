import React, {useState} from 'react';
import './App.css';
import Canvas from "./components/canvas";
import Wave from "./components/wave";

function App() {
    const [word, setWord] = useState('');

    const onSetWord = (word: string) => {
        setWord(word)
    }

    return (
        <div className="App">
            <header className="App-header">
                <Canvas word={word}/>
                <Wave setWord={onSetWord}/>
            </header>
        </div>
    );
}

export default App;
