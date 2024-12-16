/* gameinfo.jsx */

import { useRef, useState } from 'preact/hooks';
import '../css/gameinfo.css';

function GameInfo({setFocused, setValidFunct}) {

    const [funct, setFunct] = useState('0');
    const [valid, setValid] = useState(true);
    const [realFunct, setRealFunct] = useState('0');

    const inputRef = useRef(null);

    const handleInput = (e) => {
        setFunct(e.target.value);

        const validating = e.target.value;
        if (validating.trim() === '') {
            setValid(false);
            return;
        }

        const mathRegex = /^[\d+\-*/^().x\s]*(sin|cos|tan|log|exp|sqrt)?[\d+\-*/^().x\s]*$/;

        if(!mathRegex.test(validating)) {
            setValid(false);
            return;
        }

        let stack = [];
        for (let char of validating) {
            if (char === "(") {
                stack.push(char);
            }
            else if (char === ")") {
                if (!stack.length) {
                    setValid(false);
                    return;
                }
                stack.pop();
            }
        }
        if (stack.length) {
            setValid(false);
            return;
        }

        try {
            const replaced = validating.replace(/\^/g, "**")
            .replace(/sin/g, "Math.sin")
            .replace(/cos/g, "Math.cos")
            .replace(/tan/g, "Math.tan")
            .replace(/sqrt/g, "Math.sqrt")
            .replace(/log/g, "Math.log")
            .replace(/exp/g, "Math.exp");

            const func = new Function("x", `return ${replaced};`);
            console.log(func(0));

            if(isNaN(func(0))) {
                setValid(false);
                return;
            }

            setValid(true);
        } catch (error) {
            setValid(false);
            return;
        }
    }

    const handleSet = () => {
        const validating = funct;
        inputRef.current.blur();
        setFocused(true);
        if (validating.trim() === '') {
            setValid(false);
            return;
        }

        const mathRegex = /^[\d+\-*/^().x\s]*(sin|cos|tan|log|exp|sqrt)?[\d+\-*/^().x\s]*$/;

        if(!mathRegex.test(validating)) {
            setValid(false);
            return;
        }

        let stack = [];
        for (let char of validating) {
            if (char === "(") {
                stack.push(char);
            }
            else if (char === ")") {
                if (!stack.length) {
                    setValid(false);
                    return;
                }
                stack.pop();
            }
        }
        if (stack.length) {
            setValid(false);
            return;
        }

        try {
            const replaced = validating.replace(/\^/g, "**")
            .replace(/sin/g, "Math.sin")
            .replace(/cos/g, "Math.cos")
            .replace(/tan/g, "Math.tan")
            .replace(/sqrt/g, "Math.sqrt")
            .replace(/log/g, "Math.log")
            .replace(/exp/g, "Math.exp");

            const func = new Function("x", `return ${replaced};`);
            console.log(func(0));

            if(isNaN(func(0))) {
                setValid(false);
                return;
            }

            setValidFunct(funct);
            setRealFunct(funct);
            setValid(true);
        } catch (error) {
            setValid(false);
            return;
        }
    }

    return (
        <div className="game-info">
            <h3>Player Info</h3>
            <input
                ref={inputRef}
                type='text'
                placeholder='Type a function...'
                value={funct}
                onInput={handleInput}
                onKeyDown={(e) => e.key === 'Enter' && handleSet()}
                onFocus={() => setFocused(false)}
                onBlur={() => setFocused(true)}
            />
            <button onClick={handleSet}>Set</button>
            {valid ? <p>Valid function</p> : <p>Not a valid function</p>}
            <p>Current function: {realFunct}</p>
        </div>
    );
}

export default GameInfo;
