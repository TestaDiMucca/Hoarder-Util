import { AttributeType, BasicRule, Rule } from './rules.types';

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
    try {
        const uncastValue = data[rule.attribute];

        if (!uncastValue && !!rule.value) return false;

        const attrType = rule.attributeType;

        const value =
            attrType === AttributeType.number
                ? +uncastValue
                : attrType === AttributeType.date
                  ? new Date(uncastValue)
                  : uncastValue;
        const castRuleValue =
            attrType === AttributeType.number
                ? +rule.value
                : attrType === AttributeType.date
                  ? new Date(rule.value)
                  : rule.value;

        switch (rule.operator) {
            case '=':
                return value === castRuleValue;
            case '>':
                return value > castRuleValue;
            case '<':
                return value < castRuleValue;
            case '>=':
                return value >= castRuleValue;
            case '<=':
                return value <= castRuleValue;
            case '!=':
                return value !== castRuleValue;
            case 'contains':
                if (typeof value !== 'string') return false;

                return value.includes(rule.value);
            // Add more operators as needed
            default:
                return false;
        }
    } catch {
        return false;
    }
}
