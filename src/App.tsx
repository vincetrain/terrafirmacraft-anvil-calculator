import { useState } from 'react'
import './App.css'
import InstructionSelector from './components/InstructionSelector'
import type InstructionInterface from './interfaces/InstructionInterface'
import { calculate } from './scripts/calculate';

function initializeFormulaObject(length:number) {
  let outputArray = [];
  for (let i=0; i<length; i++) {
    outputArray.push({
      instruction: 'None',
      position: 'None'
    });
  }
  return outputArray;
}

function anvilRouteToString(anvilRoute:string[]) {
  let routeString = ""
  anvilRoute.forEach((instruction, idx) => {
    routeString += instruction
    if (idx < anvilRoute.length - 1) {
      routeString += ', '
    }
  })
  return routeString;
}

function App() {
  const positionalOptionChoices = ['Last', 'Second Last', 'Third Last'];
  const formula_length = 3;

  const [formula, setInstructions] = useState<InstructionInterface[]>(initializeFormulaObject(formula_length));
  const [anvilScore, setAnvilScore] = useState<number>(0);
  const [anvilRoute, setAnvilRoute] = useState<(string|undefined)[]>([]);
  const [outputString, setOutputString] = useState<string>('No output yet... Calculate something!');
  const [outputError, setOutputError] = useState<boolean>();

  const selectors = populateSelectors(formula_length, formula, setInstructions);

  function populateSelectors(length:number, instructions:InstructionInterface[], setInstructions:React.Dispatch<React.SetStateAction<InstructionInterface[]>>) {
    let outputArray = [];

    for (let i=0; i<length; i++) {
      outputArray.push(
        <InstructionSelector 
          key={i}
          index={i} 
          instructions={instructions} 
          setInstructions={setInstructions} 
          positionalOptionChoices={positionalOptionChoices} 
        />
      )
    }
    return outputArray;
  }

  function handleCalculate() {
    let hasError = false;
    let errorMessage = '';

    if (anvilScore < 7) {
      hasError = true;
      errorMessage =
        'ERROR: Anvil scores under 7 are not supported. Please enter a score equal or greater than 7.';
    }

    formula.forEach((instruction) => {
      if (instruction.instruction !== 'None' && instruction.position === 'None') {
        hasError = true;
        errorMessage += `ERROR: ${instruction.instruction}'s position cannot be 'None'.\n`;
      }
    });

    if (hasError) {
      setOutputError(true);
      setOutputString(errorMessage);
      return;
    }

    setOutputError(false);

    const result = calculate(anvilScore, formula);
    setAnvilRoute(result);
    setOutputString(anvilRouteToString(result));
  }

  return (
    <>
    <div className='calculator--container'>
      <h1 className='title'>TerraFirmaCraft Anvil Calculator</h1>
      <hr className='separator' />
      <div className='calculator--main'>
        <div className='calculator--part calculator--score'>
          <h2>Desired Anvil Score:</h2>
          <input pattern={'d+$'} onChange={(e) => {
            if (/^\d+$/.test(e.target.value)) {
              setAnvilScore(Number(e.target.value))
            }
          }} type='number'></input>
        </div>
        <div className='calculator--part calculator--formula'>
          <h2>Formula:</h2>
          {selectors}
        </div>
      </div>
      <div className='calculator--footer'>
        <button onClick={handleCalculate}>Calculate</button>
      </div>
    </div>
    <hr className='separator' />
    <b><textarea 
        className={'output ' + (anvilRoute.length > 0 ? ' calculated ' : ' placeholder ') + (outputError ? ' error' : ' ')} 
        value={outputString} 
        readOnly={true}
        /></b>
    </>
  )
}

export default App
