import {useState} from "react";
import "./wave.css"

function Wave(props: any) {
    const [tempWord, setTempWord] = useState("")

    return <div className="word-container">
        <input
            value={tempWord}
            onChange={({target}) => setTempWord(target?.value || '')}
        />
        <button onClick={() => props.setWord(tempWord)}>확인</button>
    </div>
}

export default Wave;