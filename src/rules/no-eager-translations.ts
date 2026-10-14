import { AST_NODE_TYPES, TSESLint, TSESTree, ESLintUtils } from '@typescript-eslint/utils'
import { isCallExpression, isIdentifier, isMemberExpression, isMethodDefinition } from "../utils"

const createRule = ESLintUtils.RuleCreator(
  () => "https://github.com/observation/eslint-rules"
)

type MessageIds = "eagerTranslation";
type Options = [];

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression

const isFunctionNode = (node: TSESTree.Node): node is FunctionNode =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration ||
  node.type === AST_NODE_TYPES.FunctionExpression

const isTranslationCall = (node: TSESTree.CallExpression) => {
  const { callee } = node
  return (
    isMemberExpression(callee) &&
    isIdentifier(callee.object) &&
    isIdentifier(callee.property) &&
    callee.object.name === "i18n" &&
    callee.property.name === "t"
  )
}

/**
 * Constructors run as soon as an instance is created, which for stores happens before the locale is set
 */
const isConstructor = (node: FunctionNode) => {
  const { parent } = node
  return parent !== undefined && isMethodDefinition(parent) && parent.kind === "constructor"
}

/**
 * Immediately invoked functions run as soon as the surrounding code runs, e.g. `(() => i18n.t('key'))()`
 */
const isImmediatelyInvoked = (node: FunctionNode) => {
  const { parent } = node
  return parent !== undefined && isCallExpression(parent) && parent.callee === node
}

/**
 * A translation is deferred when it is inside a function that is only executed when it is called
 */
const isDeferred = (node: TSESTree.Node): boolean => {
  let current = node.parent
  while (current) {
    if (isFunctionNode(current) && !isConstructor(current) && !isImmediatelyInvoked(current)) {
      return true
    }
    current = current.parent
  }
  return false
}

const checkCallExpression = (
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  node: TSESTree.CallExpression
) => {
  if (isTranslationCall(node) && !isDeferred(node)) {
    context.report({
      node,
      messageId: "eagerTranslation",
    })
  }
}

const noEagerTranslations = createRule<Options, MessageIds>({
  create(context) {
    return {
      CallExpression: (node) => checkCallExpression(context, node),
    }
  },
  name: "no-eager-translations",
  meta: {
    docs: {
      description:
        "Translations should be evaluated when they are used, not when a module is loaded or a class is instantiated",
    },
    messages: {
      eagerTranslation:
        "i18n.t() is evaluated before the locale is set, so it is always in the default language. Move it into a function that is called when the text is needed.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
})

export default noEagerTranslations
