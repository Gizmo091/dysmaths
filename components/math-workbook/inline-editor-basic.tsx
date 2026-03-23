import type {InputHTMLAttributes, ReactNode} from "react";
import {type FractionBlock, type PowerBlock, type RootBlock} from "@/components/math-workbook/shared";

type InputBinder = (
  field: string
) => InputHTMLAttributes<HTMLInputElement> & {
  ref: (node: HTMLInputElement | null) => void;
};

export function renderBasicInlineEditor(block: FractionBlock | PowerBlock | RootBlock, bindInlineInput: InputBinder): ReactNode {
  if (block.type === "fraction") {
    return (
      <div className="math-layout fraction-layout">
        <div className="fraction-preview fraction-preview-editing">
          <input {...bindInlineInput("numerator")} value={block.numerator} placeholder="a" className="math-inline-input fraction-inline-input" />
          <div className="fraction-bar" />
          <input {...bindInlineInput("denominator")} value={block.denominator} placeholder="b" className="math-inline-input fraction-inline-input" />
        </div>
      </div>
    );
  }

  if (block.type === "power") {
    return (
      <div className="math-layout power-layout">
        <p className="power-preview power-preview-editing">
          <input {...bindInlineInput("base")} value={block.base} placeholder="a" className="math-inline-input power-inline-base" />
          <sup>
            <input {...bindInlineInput("exponent")} value={block.exponent} placeholder="n" className="math-inline-input power-inline-exponent" />
          </sup>
        </p>
      </div>
    );
  }

  return (
    <div className="math-layout root-layout">
      <div className="root-preview root-preview-editing">
        <span className="root-symbol">√</span>
        <input {...bindInlineInput("radicand")} value={block.radicand} placeholder="a" className="math-inline-input root-inline-radicand" />
      </div>
    </div>
  );
}
