import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";

export const isCallExpression = (
  statement: TSESTree.Node
): statement is TSESTree.CallExpression => {
  return statement.type === AST_NODE_TYPES.CallExpression;
};

export const isMemberExpression = (
  statement: TSESTree.Node
): statement is TSESTree.MemberExpression => {
  return statement.type === AST_NODE_TYPES.MemberExpression;
};

export const isIdentifier = (
  statement: TSESTree.Node
): statement is TSESTree.Identifier => {
  return statement.type === AST_NODE_TYPES.Identifier;
};

export const isExpressionStatement = (
  statement: TSESTree.Node
): statement is TSESTree.ExpressionStatement => {
  return statement.type === AST_NODE_TYPES.ExpressionStatement;
};

export const isLiteral = (
  statement: TSESTree.Node
): statement is TSESTree.Literal => {
  return statement.type === AST_NODE_TYPES.Literal;
};

export const isMethodDefinition = (
  statement: TSESTree.Node
): statement is TSESTree.MethodDefinition => {
  return statement.type === AST_NODE_TYPES.MethodDefinition;
};

export const isArrowFunctionExpression = (
  statement: TSESTree.Node
): statement is TSESTree.ArrowFunctionExpression => {
  return statement.type === AST_NODE_TYPES.ArrowFunctionExpression;
};

export const isBlockStatement = (
  statement: TSESTree.Node
): statement is TSESTree.BlockStatement => {
  return statement.type === AST_NODE_TYPES.BlockStatement;
};

export const isFunctionDeclaration = (
  statement: TSESTree.Node
): statement is TSESTree.FunctionDeclaration => {
  return statement.type === AST_NODE_TYPES.FunctionDeclaration;
};

export const isPropertyDefinition = (
  statement: TSESTree.Node
): statement is TSESTree.PropertyDefinition => {
  return statement.type === AST_NODE_TYPES.PropertyDefinition;
};

export const isVariableDeclaration = (
  statement: TSESTree.Node
): statement is TSESTree.VariableDeclaration => {
  return statement.type === AST_NODE_TYPES.VariableDeclaration;
};

export const isVariableDeclarator = (
  statement: TSESTree.Node
): statement is TSESTree.VariableDeclarator => {
  return statement.type === AST_NODE_TYPES.VariableDeclarator;
};

export const isFunctionExpression = (
  statement: TSESTree.Node
): statement is TSESTree.FunctionExpression => {
  return statement.type === AST_NODE_TYPES.FunctionExpression;
};
