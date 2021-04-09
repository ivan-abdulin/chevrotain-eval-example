import {
  createToken,
  Lexer,
  CstParser,
  CstNode
} from 'chevrotain'

import {
  IOperators,
  IExpressionCtx,
  IAdditionCtx,
  IEvalCtx
} from './types'

const Num = createToken({ name: 'Num', pattern: /[1-9][0-9]*/ })
const Plus = createToken({ name: 'Plus', pattern: /\+/ })
const Whitespace = createToken({ name: 'Whitespace', pattern: /\s+/, group: Lexer.SKIPPED })
const Str = createToken({ name: 'Str', pattern: /"[^"]*"/ })
const EvalFunction = createToken({ name: 'EvalFunction', pattern: /eval/i })
const LParenthesis = createToken({ name: 'LParenthesis', pattern: /\(/ })
const RParenthesis = createToken({ name: 'RParenthesis', pattern: /\)/ })

const operators = {
  Num,
  Plus,
  Whitespace,
  Str,
  EvalFunction,
  LParenthesis,
  RParenthesis
}

class EvalParser extends CstParser {
  public expression: (idx: number) => CstNode
  public addition: (idx: number) => CstNode
  public eval: (idx: number) => CstNode

  constructor (
    private operators: IOperators
  ) {
    super(operators)
    this.bootstrapRules()
    this.performSelfAnalysis()
  }

  private bootstrapRules () {
    const {
      Num,
      Plus,
      Str,
      EvalFunction,
      LParenthesis,
      RParenthesis
    } = this.operators

    this.RULE('expression', () => this.OR([
      { ALT: () => this.SUBRULE(this.addition) },
      { ALT: () => this.SUBRULE(this.eval) }
    ]))

    this.RULE('addition', () => {
      this.CONSUME(Num)
      this.CONSUME(Plus)
      this.CONSUME2(Num)
    })

    this.RULE('eval', () => {
      this.CONSUME(EvalFunction)
      this.CONSUME(LParenthesis)
      this.CONSUME(Str)
      this.CONSUME(RParenthesis)
    })
  }
}


const parser = new EvalParser(operators)
const BaseCstVisitor = parser.getBaseCstVisitorConstructor()

class EvalVisitor extends BaseCstVisitor {
  constructor (
    private lexer: Lexer,
    private parser: EvalParser
  ) {
    super()
    this.validateVisitor()
  }

  public expression (ctx: IExpressionCtx) {
    if ('addition' in ctx) {
      return this.visit(ctx.addition)
    }

    return this.visit(ctx.eval)
  }

  public addition (ctx: IAdditionCtx): number {
    return parseInt(ctx.Num[0].image) + parseInt(ctx.Num[1].image)
  }

  public eval (ctx: IEvalCtx): number {
    const code = ctx.Str[0].image.replace(/"/g, '')
    const lexResult = this.lexer.tokenize(code)
    this.parser.input = lexResult.tokens
    // @ts-ignore
    const cst = this.parser.expression()
    const result = this.visit(cst)
    return result
  }
}

let code: string
if (process.env.OP === 'eval') {
  console.log('EVAL("3 + 3")')
  code = 'EVAL("3 + 3")'
} else {
  console.log('2 + 2')
  code = '2 + 2'
}

const lexer = new Lexer(Object.values(operators))
const lexResult = lexer.tokenize(code)
parser.input = lexResult.tokens
// @ts-ignore
const cst = parser.expression()
const visitor = new EvalVisitor(lexer, parser)

console.log('result = ', visitor.visit(cst))
