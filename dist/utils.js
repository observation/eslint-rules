"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunctionExpression = exports.isVariableDeclarator = exports.isVariableDeclaration = exports.isPropertyDefinition = exports.isFunctionDeclaration = exports.isBlockStatement = exports.isArrowFunctionExpression = exports.isMethodDefinition = exports.isLiteral = exports.isExpressionStatement = exports.isIdentifier = exports.isMemberExpression = exports.isCallExpression = void 0;
const utils_1 = require("@typescript-eslint/utils");
const isCallExpression = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.CallExpression;
};
exports.isCallExpression = isCallExpression;
const isMemberExpression = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.MemberExpression;
};
exports.isMemberExpression = isMemberExpression;
const isIdentifier = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.Identifier;
};
exports.isIdentifier = isIdentifier;
const isExpressionStatement = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.ExpressionStatement;
};
exports.isExpressionStatement = isExpressionStatement;
const isLiteral = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.Literal;
};
exports.isLiteral = isLiteral;
const isMethodDefinition = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.MethodDefinition;
};
exports.isMethodDefinition = isMethodDefinition;
const isArrowFunctionExpression = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.ArrowFunctionExpression;
};
exports.isArrowFunctionExpression = isArrowFunctionExpression;
const isBlockStatement = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.BlockStatement;
};
exports.isBlockStatement = isBlockStatement;
const isFunctionDeclaration = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.FunctionDeclaration;
};
exports.isFunctionDeclaration = isFunctionDeclaration;
const isPropertyDefinition = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.PropertyDefinition;
};
exports.isPropertyDefinition = isPropertyDefinition;
const isVariableDeclaration = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.VariableDeclaration;
};
exports.isVariableDeclaration = isVariableDeclaration;
const isVariableDeclarator = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.VariableDeclarator;
};
exports.isVariableDeclarator = isVariableDeclarator;
const isFunctionExpression = (statement) => {
    return statement.type === utils_1.AST_NODE_TYPES.FunctionExpression;
};
exports.isFunctionExpression = isFunctionExpression;
