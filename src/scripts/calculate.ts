import type InstructionInterface from '../interfaces/InstructionInterface';

const ACTIONS: Record<string, number> = {
    'Light Hit': -3,
    'Medium Hit': -6,
    'Heavy Hit': -9,
    'Draw': -15,
    'Punch': 2,
    'Bend': 7,
    'Upset': 13,
    'Shrink': 16,
};

function sortFormula(formula: InstructionInterface[]) {
    let formulaSorted = [...formula]
    formulaSorted.forEach((instruction, idx) => {
        let idx_cur = idx;
        for (let _ = 0; _ < 1; _++) {
            if (/^\d+$/.test(instruction.position)) {
                const pos_wish = Number(instruction.position);
                const tempInstruction = { ...formulaSorted[pos_wish] }
                formulaSorted[pos_wish] = instruction
                formulaSorted[idx] = tempInstruction
            }
            else if (instruction.position == '!' && idx == 0) {
                idx_cur += 1;
                const tempInstruction = { ...formulaSorted[idx_cur] }
                formulaSorted[idx_cur] = instruction
                formulaSorted[idx] = tempInstruction
            }
        }
    })
    return formulaSorted;
}

function applyFormula(score: number, formula: InstructionInterface[]): number {
    formula.forEach((instruction) => {
        if (instruction.position != 'None' && instruction.instruction != 'None') {
            score -= ACTIONS[instruction.instruction];
        }
    });

    return score;
}

type ActionMap = Record<string, number>;

function findClosestCombination(score: number, currentScore: number = 0, actions: ActionMap | null = null): [number, ActionMap] {
    if (actions === null) {
        actions = { 
            'Shrink': 0, 
            'Upset': 0, 
            'Bend': 0, 
            'Punch': 0 };
    }

    let bestScore = currentScore;
    let bestActions: ActionMap = { ...actions };

    for (const branch in ACTIONS) {
        if (!(branch in actions)) continue;

        const value = ACTIONS[branch];

        const newScore = currentScore + value;

        if (newScore > score) continue;

        const newActions: ActionMap = { ...actions };
        newActions[branch] += 1;

        const [candidateScore, candidateActions] = findClosestCombination(
            score,
            newScore,
            newActions
        );

        const candidateCount = Object.values(candidateActions).reduce((a, b) => a + b, 0);
        const bestCount = Object.values(bestActions).reduce((a, b) => a + b, 0);

        if (
            candidateScore > bestScore ||
            (candidateScore === bestScore && candidateCount < bestCount)
        ) {
            bestScore = candidateScore;
            bestActions = candidateActions;
        }
    }

    return [bestScore, bestActions];
}

function createFullAnvilRoute(formula: InstructionInterface[], combination: Record<string, number>) {
    let route = []
    for (const [key, value] of Object.entries(combination)) {
        for (let i = 0; i < value; i++) {
            route.push(key)
        }
    }

    let formulaLength = 0;
    formula.forEach((instruction) => {
        if (instruction.instruction != 'None' && instruction.position != 'None') {
            formulaLength++;
        }
    })

    formula.forEach((instruction) => {
        if (instruction.instruction !== 'None' && /^\d+$/.test(instruction.position)) {
            route.splice(route.length - Number(instruction.position),0,instruction.instruction);
        }
    });

    formula.forEach((instruction) => {
        if (instruction.position == '!' || instruction.position == '*') {
            let currentScore = 0;
            let idx = 0;
            if (ACTIONS[instruction.instruction] < 0) {
                while (currentScore < ACTIONS[instruction.instruction]*-1) {
                    currentScore += ACTIONS[route[idx]];
                    idx++;
                }
            }
            console.log(idx)
            route.splice(idx, 0, instruction.instruction)
        }
    });
    return route;
}

export function calculate(score: number, formula: InstructionInterface[]) {
    formula = sortFormula(formula);

    score = applyFormula(score, formula);

    let shrinkAmount = Math.floor(score / ACTIONS['Shrink'])

    while (score - (ACTIONS['Shrink'] * shrinkAmount) < 16) {
        shrinkAmount -= 1;
    }

    score -= ACTIONS['Shrink'] * shrinkAmount;

    let bestCombo = findClosestCombination(score);

    bestCombo[1]['Shrink'] += shrinkAmount;

    return createFullAnvilRoute(formula, bestCombo[1]);
}