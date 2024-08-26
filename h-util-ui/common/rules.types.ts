export enum Operator {
    eq = '=',
    gt = '>',
    lt = '<',
    gte = '>=',
    lte = '<=',
    ne = '!=',
    contains = 'contains',
    notContains = 'does not contain',
}

export enum AttributeType {
    string = 'string',
    date = 'date',
    number = 'number',
    boolean = 'boolean',
}

export interface BasicRule<T extends string = string> {
    type: 'basic';
    attribute: T;
    attributeType: AttributeType;
    operator: Operator;
    value: string;
}

export interface LogicalGroup<T extends string = string> {
    type: 'AND' | 'OR';
    rules: Rule<T>[];
}

export type Rule<T extends string = string> = BasicRule<T> | LogicalGroup<T>;

export interface RuleSet {
    name?: string;
    description?: string;
    root: Rule;
}
