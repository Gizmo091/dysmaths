import type {InputHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode} from "react";
import {
  getAlignedCaretCellIndex,
  getDivisionDivisorColumns,
  getDivisionLeftColumns,
  getDivisionMaxWorkLines,
  getDivisionQuotientColumns,
  getDivisionVisibleWorkLines,
  normalizeDivisionDecimalInput,
  renderDivisionCellRow,
  setDivisionWorkLine,
  type DivisionBlock,
  type MathBlock
} from "@/components/math-workbook/shared";

type InputBinder = (
  field: string
) => InputHTMLAttributes<HTMLInputElement> & {
  ref: (node: HTMLInputElement | null) => void;
};

type DivisionInlineEditorProps = {
  block: DivisionBlock;
  currentField: string | null;
  isStrikeModeActive: boolean;
  numericFieldCaretPositions: Record<string, number>;
  bindInlineInput: InputBinder;
  wrapInlineOperationEditor: (blockId: string, content: ReactNode) => ReactNode;
  updateNumericCaretPosition: (key: string, nextPosition: number) => void;
  updateInlineBlockField: (blockId: string, key: string, value: string) => void;
  handleInlineNumericDeleteKey: (blockId: string, field: string, value: string, event: ReactKeyboardEvent<HTMLInputElement>) => boolean;
  activateNumericCellSelection: (blockId: string, field: string, value: string, columns: number, align: "start" | "end", cellIndex: number) => void;
  toggleInlineBlockCellStrike: (blockId: string, field: string, cellIndex: number) => void;
  setEditingField: (blockId: string, field: string) => void;
  finishBlockEditing: (blockId: string) => void;
  setDivisionWorkValue: (blockId: string, lineIndex: number, nextValue: string) => void;
};

export function renderDivisionInlineEditor({
  block,
  currentField,
  isStrikeModeActive,
  numericFieldCaretPositions,
  bindInlineInput,
  wrapInlineOperationEditor,
  updateNumericCaretPosition,
  updateInlineBlockField,
  handleInlineNumericDeleteKey,
  activateNumericCellSelection,
  toggleInlineBlockCellStrike,
  setEditingField,
  finishBlockEditing,
  setDivisionWorkValue
}: DivisionInlineEditorProps): ReactNode {
  const leftColumns = getDivisionLeftColumns(block);
  const divisorColumns = getDivisionDivisorColumns(block);
  const quotientColumns = getDivisionQuotientColumns(block);
  const divisionWorkLines = getDivisionVisibleWorkLines(block.work, block.quotient);

  const renderDivisionEditableRow = (
    field: string,
    value: string,
    columns: number,
    className: string,
    onUpdate: (nextValue: string) => void
  ) => {
    const isActive = currentField === field;
    const caretKey = `${block.id}:${field}`;
    const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(value).length;
    const targetCellIndex = getAlignedCaretCellIndex(value, columns, "start", caretPosition);
    const baseInputProps = bindInlineInput(field);

    return (
      <div className={`division-number-field ${isActive ? "division-number-field-active" : ""}`} style={{["--division-columns" as string]: columns}}>
        <input
          {...baseInputProps}
          value={value}
          inputMode="decimal"
          pattern="[0-9,]*"
          className={`division-dividend-field ${isStrikeModeActive ? "division-number-field-input-strike-mode" : ""}`}
          onFocus={() => {
            baseInputProps.onFocus?.({} as never);
          }}
          onClick={(event) => {
            updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(value).length);
          }}
          onKeyUp={(event) => {
            updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
          }}
          onSelect={(event) => {
            updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
          }}
          onChange={(event) => {
            const nextValue = normalizeDivisionDecimalInput(event.target.value);
            onUpdate(nextValue);
            updateNumericCaretPosition(caretKey, event.target.selectionStart ?? Array.from(nextValue).length);
          }}
          onKeyDown={(event) => {
            if (handleInlineNumericDeleteKey(block.id, field, value, event)) {
              return;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              const lineIndex = Number.parseInt(field.slice(5), 10);
              const visibleLines = getDivisionVisibleWorkLines(block.work, block.quotient);
              const maxLines = getDivisionMaxWorkLines(block.quotient);

              if (lineIndex < visibleLines.length - 1 || ((visibleLines[lineIndex] ?? "").trim().length > 0 && lineIndex < maxLines - 1)) {
                setEditingField(block.id, `work:${lineIndex + 1}`);
                return;
              }

              finishBlockEditing(block.id);
              return;
            }

            if (event.key === "Tab") {
              event.preventDefault();
              const lineIndex = Number.parseInt(field.slice(5), 10);
              const nextField = event.shiftKey ? (lineIndex > 0 ? `work:${lineIndex - 1}` : "quotient") : `work:${lineIndex + 1}`;

              setEditingField(block.id, nextField);
              return;
            }

            baseInputProps.onKeyDown?.(event);
          }}
        />
        {renderDivisionCellRow(value, columns, `${className} division-number-field-display ${isStrikeModeActive ? "division-number-field-display-strike-mode" : ""}`, "start", isActive ? targetCellIndex : undefined, {
          field,
          struckCells: block.struckCells,
          onCellToggle: (cellIndex, cellValue) => {
            if (!isStrikeModeActive) {
              activateNumericCellSelection(block.id, field, value, columns, "start", cellIndex);
              return;
            }

            if (!cellValue.trim()) {
              return;
            }

            toggleInlineBlockCellStrike(block.id, field, cellIndex);
          }
        })}
      </div>
    );
  };

  const renderDivisionNumericField = (
    field: "dividend" | "divisor" | "quotient",
    value: string,
    columns: number,
    wrapperClassName: string,
    inputClassName: string,
    displayClassName: string
  ) => {
    const isActive = currentField === field;
    const caretKey = `${block.id}:${field}`;
    const caretPosition = numericFieldCaretPositions[caretKey] ?? Array.from(value).length;
    const align = "start";
    const targetCellIndex = getAlignedCaretCellIndex(value, columns, align, caretPosition);
    const baseInputProps = bindInlineInput(field);

    return (
      <div className={`division-number-field ${wrapperClassName} ${isActive ? "division-number-field-active" : ""}`} style={{["--division-columns" as string]: columns}}>
        <input
          {...baseInputProps}
          value={value}
          inputMode="decimal"
          pattern="[0-9,]*"
          className={`${inputClassName} ${isStrikeModeActive ? "division-number-field-input-strike-mode" : ""}`}
          onFocus={() => {
            baseInputProps.onFocus?.({} as never);
          }}
          onClick={(event) => {
            updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(value).length);
          }}
          onKeyUp={(event) => {
            updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
          }}
          onSelect={(event) => {
            updateNumericCaretPosition(caretKey, event.currentTarget.selectionStart ?? Array.from(event.currentTarget.value).length);
          }}
          onChange={(event) => {
            const nextValue = normalizeDivisionDecimalInput(event.target.value);
            updateInlineBlockField(block.id, field, nextValue);
            updateNumericCaretPosition(caretKey, event.target.selectionStart ?? Array.from(nextValue).length);
          }}
          onKeyDown={(event) => {
            if (handleInlineNumericDeleteKey(block.id, field, value, event)) {
              return;
            }

            baseInputProps.onKeyDown?.(event);
          }}
        />
        {renderDivisionCellRow(value, columns, `${displayClassName} division-number-field-display ${isStrikeModeActive ? "division-number-field-display-strike-mode" : ""}`, align, isActive ? targetCellIndex : undefined, {
          field,
          struckCells: block.struckCells,
          onCellToggle: (cellIndex, cellValue) => {
            if (!isStrikeModeActive) {
              activateNumericCellSelection(block.id, field, value, columns, align, cellIndex);
              return;
            }

            if (!cellValue.trim()) {
              return;
            }

            toggleInlineBlockCellStrike(block.id, field, cellIndex);
          }
        })}
      </div>
    );
  };

  return wrapInlineOperationEditor(
    block.id,
    <div className="math-layout division-layout">
      <div className="division-preview">
        <div className="division-left-column">
          <div className="division-work-line division-work-line-head">
            <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />
            {renderDivisionNumericField("dividend", block.dividend, leftColumns, "division-dividend-field-shell", "division-dividend-field", "division-dividend")}
          </div>
          <div className="division-work-grid">
            {divisionWorkLines.map((line, index) => {
              const shouldShowResultLine = index % 2 === 0 && (divisionWorkLines[index + 1] ?? "").trim().length > 0;
              return (
                <div
                  key={index}
                  className={`division-work-line ${index % 2 === 0 ? "division-work-line-operation" : "division-work-line-result"} ${shouldShowResultLine ? "division-work-line-operation-complete" : ""} ${line.trim().length === 0 ? "division-work-line-pending" : ""}`}
                >
                  {index % 2 === 0 ? <span className="division-work-minus">-</span> : <span className="division-work-minus division-work-minus-spacer" aria-hidden="true" />}
                  {renderDivisionEditableRow(`work:${index}`, line, leftColumns, "division-workpad", (nextValue) => setDivisionWorkValue(block.id, index, nextValue))}
                </div>
              );
            })}
          </div>
        </div>
        <div className="division-right-column">
          {renderDivisionNumericField("divisor", block.divisor, divisorColumns, "division-divisor-field-shell", "division-divisor-field", "division-divisor")}
          {renderDivisionNumericField("quotient", block.quotient, quotientColumns, "division-quotient-field-shell", "division-quotient-field", "division-quotient")}
        </div>
      </div>
    </div>
  );
}
