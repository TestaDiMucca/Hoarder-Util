import { AttributeType, Operator, Rule } from './rules.types';
import { evaluateRule } from './rules.utils';

type RuleTestScenario<T extends string = string> = {
    data: Partial<Record<T, string>>;
    rule: Rule<T>;
    result: boolean;
};

/** Literally just to enforce types, doesn't do anything so special */
const createRuleTestScenario = <T extends string>(scenarios: RuleTestScenario<T>[]): RuleTestScenario<T>[] => {
    return scenarios;
};

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
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.string,
                    operator: Operator.ne,
                    attribute: 'name',
                    value: 'nero.png',
                },
                data: {
                    name: 'nero.png',
                },
                result: false,
            },
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.string,
                    operator: Operator.ne,
                    attribute: 'name',
                    value: 'nero.png',
                },
                data: {
                    name: 'ishtar.png',
                },
                result: true,
            },
        ]),
    )('Simple string matches', (scenario) => {
        const result = evaluateRule(scenario.rule, scenario.data);

        expect(result).toEqual(scenario.result);
    });

    test.each(
        createRuleTestScenario([
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.number,
                    operator: Operator.lt,
                    attribute: 'fileSize',
                    value: '2000',
                },
                result: true,
                data: {
                    fileSize: '1000',
                },
            },
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.number,
                    operator: Operator.lt,
                    attribute: 'fileSize',
                    value: '500',
                },
                result: false,
                data: {
                    fileSize: '1000',
                },
            },
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.number,
                    operator: Operator.gt,
                    attribute: 'fileSize',
                    value: '500',
                },
                result: true,
                data: {
                    fileSize: '1000',
                },
            },
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.number,
                    operator: Operator.gt,
                    attribute: 'fileSize',
                    value: '2000',
                },
                result: false,
                data: {
                    fileSize: '1000',
                },
            },
        ]),
    )('Number matches', (scenario) => {
        const result = evaluateRule(scenario.rule, scenario.data);

        expect(result).toEqual(scenario.result);
    });

    test.each(
        createRuleTestScenario([
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.date,
                    operator: Operator.lt,
                    attribute: 'created',
                    value: '2024-04-01',
                },
                result: false,
                data: {
                    created: '2024-05-01',
                },
            },
            {
                rule: {
                    type: 'basic',
                    attributeType: AttributeType.date,
                    operator: Operator.lt,
                    attribute: 'created',
                    value: '2024-06-01',
                },
                result: true,
                data: {
                    created: '2024-05-01',
                },
            },
        ]),
    )('Date rules', (scenario) => {
        const result = evaluateRule(scenario.rule, scenario.data);

        expect(result).toEqual(scenario.result);
    });
});
