import { ProcessingModule, ProcessingModuleType } from '@shared/common.types';

export interface PipelineOptionsProps {
    moduleType: ProcessingModuleType;
    currentOptions: ProcessingModule['options'];
    handleOptionChange: (flag: keyof ProcessingModule['options'], newValue: string) => void;
}

export function extractStringTemplate(input: string): string | null {
    // Get all indices of '%' in the input string
    const indices: number[] = [];
    let index = input.indexOf('%');
    while (index !== -1) {
        indices.push(index);
        index = input.indexOf('%', index + 1);
    }

    // Filter out only the odd occurrences (1st, 3rd, 5th, etc.)
    const oddIndices = indices.filter((_, idx) => idx % 2 === 0); // index starts at 0, so 0, 2, 4 are 'odd' positions

    // Find the last odd occurrence
    const lastOddIndex = oddIndices.pop();

    // Return the substring from the character after the last odd occurrence
    if (lastOddIndex !== undefined) {
        return input.substring(lastOddIndex + 1);
    } else {
        return null; // Or return the whole string or an empty string based on requirements
    }
}
