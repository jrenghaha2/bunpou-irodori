import { memo, useMemo } from 'react';
import type { FormulaTokenKind } from '../types/bunpou';
import { FORMULA_LEGEND, tokenizeFormula } from '../utils/formulaTokenizer';

const TOKEN_STYLES: Record<FormulaTokenKind, string> = {
  verb: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 font-semibold px-2 py-0.5 rounded-lg font-jp',
  noun: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 font-semibold px-2 py-0.5 rounded-lg font-jp',
  adj: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 font-semibold px-2 py-0.5 rounded-lg font-jp',
  particle:
    'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 font-bold px-2 py-0.5 rounded-lg font-jp',
  plain:
    'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 rounded-lg',
  operator: 'text-slate-400 dark:text-slate-500 font-mono-num text-xs px-0.5 select-none',
  note: 'text-slate-500 dark:text-slate-400 text-xs italic',
  text: 'text-slate-900 dark:text-slate-100 font-jp font-semibold',
};

interface FormulaDisplayProps {
  formulas: string[];
  compact?: boolean;
  centered?: boolean;
}

export const FormulaDisplay = memo(function FormulaDisplay({
  formulas,
  compact = false,
  centered = false,
}: FormulaDisplayProps) {
  const tokenizedLines = useMemo(() => formulas.map(line => tokenizeFormula(line)), [formulas]);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
      {tokenizedLines.map((tokens, lineIdx) => (
        <div
          key={lineIdx}
          className={`flex flex-wrap items-center gap-1.5 ${
            centered ? 'justify-center' : ''
          } ${compact ? 'text-xs sm:text-[13px]' : 'text-sm'} leading-relaxed`}
        >
          {tokens.map((tok, tokIdx) => (
            <span key={tokIdx} className={TOKEN_STYLES[tok.kind]}>
              {tok.text}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
});

export function FormulaLegend() {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300"
      aria-label="Legenda warna rumus tata bahasa"
    >
      <span className="font-semibold text-slate-900 dark:text-slate-100">Kode warna:</span>
      {FORMULA_LEGEND.map(item => (
        <span key={item.kind} className="inline-flex items-center gap-1.5">
          <span className={`${TOKEN_STYLES[item.kind]} text-[11px] px-1.5 py-0`}>
            {item.example}
          </span>
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}
