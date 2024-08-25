import { BasicRule, Rule } from './rules.types';

export const evaluateRule = (rule: Rule, data: Record<string, string>): boolean => {
    if (rule.type === 'basic') return evaluateBasicRule(rule, data);

    if (rule.type === 'AND') {
        return rule.rules.every((subRule) => evaluateRule(subRule, data));
    } else if (rule.type === 'OR') {
        return rule.rules.some((subRule) => evaluateRule(subRule, data));
    }

    return false;
};

export function evaluateBasicRule<T extends string = string>(
    rule: BasicRule<T>,
    data: Record<string, string>,
): boolean {
    const value = data[rule.attribute];
    switch (rule.operator) {
        case '=':
            return value === rule.value;
        case '>':
            return value > rule.value;
        case '<':
            return value < rule.value;
        case '>=':
            return value >= rule.value;
        case '<=':
            return value <= rule.value;
        case '!=':
            return value !== rule.value;
        case 'contains':
            return value.includes(rule.value);
        // Add more operators as needed
        default:
            return false;
    }
}
