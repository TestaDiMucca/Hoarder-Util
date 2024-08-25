import { AttributeType, Operator, Rule } from './rules.types';
import { evaluateRule } from './rules.utils';

type RuleTestScenario<T extends string = string> = {
    data: Partial<Record<T, string>>;
    rule: Rule<T>;
    result: boolean;
};

/** Literally just to enforce types, doesn't do anything so special */
const createRuleTestScenario = <T extends string>(scenarios: RuleTestScenario<T>[]): RuleTestScenario<T>[] => scenarios;

describe('le rules system', () => {
    test.each(
        createRuleTestScenario([
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.string,
                    operator: Operator.eq,
                    attribute: 'name',
                    value: 'IMG0000.txt',
                },
                result: false,
                data: {
                    name: 'string',
                },
            },
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.string,
                    operator: Operator.eq,
                    attribute: 'name',
                    value: 'homework.mp4',
                },
                result: true,
                data: {
                    name: 'homework.mp4',
                },
            },
        ]),
    )('Simple string matches', (scenario) => {
        const result = evaluateRule(scenario.rule, scenario.data);

        expect(result).toEqual(scenario.result);
    });
});
