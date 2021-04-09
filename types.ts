import { TokenType, CstNode, IToken } from 'chevrotain'

export type IOperators = {
  Plus: TokenType
  Num: TokenType
  Str: TokenType
  Whitespace: TokenType
  EvalFunction: TokenType
  LParenthesis: TokenType
  RParenthesis: TokenType
}

export type IAdditionCtx = {
  Num: IToken[]
  Plus: IToken[]
}

export interface IAdditionNode extends CstNode {
  name: 'addition'
  children: IAdditionCtx
}

export type IEvalCtx = {
  EvalFunction: IToken[]
  LParenthesis: IToken[]
  RParenthesis: IToken[]
  Str: IToken[]
}

export interface IEvalNode {
  name: 'eval',
  children: IEvalCtx
}

export type IAdditionExpressionCtx = {
  addition: IAdditionNode[]
}

export type IEvalExpressionCtx = {
  eval: IEvalNode[]
}

export type IExpressionCtx = IAdditionExpressionCtx | IEvalExpressionCtx
