import { AST_NODE_TYPES } from '@typescript-eslint/utils';
export const isCallExpression = (statement) => {
    return statement.type === AST_NODE_TYPES.CallExpression;
};
export const isMemberExpression = (statement) => {
    return statement.type === AST_NODE_TYPES.MemberExpression;
};
export const isIdentifier = (statement) => {
    return statement.type === AST_NODE_TYPES.Identifier;
};
export const isExpressionStatement = (statement) => {
    return statement.type === AST_NODE_TYPES.ExpressionStatement;
};
export const isLiteral = (statement) => {
    return statement.type === AST_NODE_TYPES.Literal;
};
export const isMethodDefinition = (statement) => {
    return statement.type === AST_NODE_TYPES.MethodDefinition;
};
export const isArrowFunctionExpression = (statement) => {
    return statement.type === AST_NODE_TYPES.ArrowFunctionExpression;
};
export const isBlockStatement = (statement) => {
    return statement.type === AST_NODE_TYPES.BlockStatement;
};
export const isFunctionDeclaration = (statement) => {
    return statement.type === AST_NODE_TYPES.FunctionDeclaration;
};
export const isPropertyDefinition = (statement) => {
    return statement.type === AST_NODE_TYPES.PropertyDefinition;
};
export const isVariableDeclaration = (statement) => {
    return statement.type === AST_NODE_TYPES.VariableDeclaration;
};
export const isVariableDeclarator = (statement) => {
    return statement.type === AST_NODE_TYPES.VariableDeclarator;
};
export const isFunctionExpression = (statement) => {
    return statement.type === AST_NODE_TYPES.FunctionExpression;
};
