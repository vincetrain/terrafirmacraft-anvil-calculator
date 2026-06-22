import type InstructionInterface from '../interfaces/InstructionInterface'
import { useState, useEffect, useMemo } from 'react'
import './InstructionSelector.css'

interface InstructionSelectorProps {
    index: number
    instructions: InstructionInterface[]
    positionalOptionChoices: string[]
    setInstructions: React.Dispatch<React.SetStateAction<InstructionInterface[]>>
}

export default function InstructionSelector({index, instructions, positionalOptionChoices, setInstructions }: InstructionSelectorProps) {
    const [positionalOptions, setPositionalOptions] = useState<React.JSX.Element[]>([])
    const disabledOptions = useMemo(
        () => {
            let disabledFlags = {}
            instructions.forEach((instruction, idx) => {
                if (/^\d+$/.test(instruction.position)) {
                    if (positionalOptionChoices.includes(positionalOptionChoices[Number(instruction.position)])) {
                        disabledFlags[positionalOptionChoices[Number(instruction.position)]] = true
                    } else {
                        disabledFlags[positionalOptionChoices[Number(instruction.position)]] = false
                    }
                }
            })
            return disabledFlags;
        }, [instructions]
    )

    function populatePositionalOptions(options, optionsUsed) {
        let newOptions = []
        options.forEach((option, idx) => {
            newOptions.push(
                <option value={`${idx}`} key={idx} disabled={optionsUsed[option]}>{option}</option>
            )
        })
        setPositionalOptions(newOptions)
    }

    function handleInstructionChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value;
        setInstructions(prev => {
            const copy = [...prev];
            copy[index].instruction = value;
            if (value == 'None') {
                copy[index].position = 'None';
            }
            return copy;
        });
    }

    function handlePositionChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value;
        setInstructions(prev => {
            const copy = [...prev];
            copy[index] = {...copy[index],position:value};
            return copy;
        });
    }

    useEffect(() => {
        populatePositionalOptions(positionalOptionChoices, disabledOptions)
    }, [instructions])
    
    return (
        <div className='instruction-selector'>
            <select value={instructions[index].instruction} onChange={handleInstructionChange}>
                <option value={'None'}>No Action</option>
                <option value={'Light Hit'}>Light Hit (-3)</option>
                <option value={'Medium Hit'}>Medium Hit (-6)</option>
                <option value={'Heavy Hit'}>Heavy Hit (-9)</option>
                <option value={'Draw'}>Draw (-15)</option>
                <option value={'Punch'}>Punch (+2)</option>
                <option value={'Bend'}>Bend (+7)</option>
                <option value={'Upset'}>Upset (+13)</option>
                <option value={'Shrink'}>Shrink (+16)</option>
            </select>
            <select disabled={instructions[index].instruction == 'None' ? true : false} value={instructions[index].position} onChange={handlePositionChange}>
                <option value={'None'}>No Position</option>
                {positionalOptions}
                <option value={'*'}>Any</option>
                <option value={'!'}>Not Last</option>
            </select>
        </div>
    )
}