import type {ReactNode} from "react";
import {getGeometryAngleDegrees, getGeometryPolarPoint, getGeometryProtractorPaths, getGeometrySignedAngleDelta, getGraduatedLineEndpointLabel, getGraduatedLineLabelPosition, getGraduatedLineRenderTicks, getGraduatedLineSectionCount, getGraduatedLineStartValue, getRenderedLinearGeometryPx, mmToPx, type GeometryLinearShape, type GeometryPointCoordinate, type MathBlock, type WorkbookTranslator} from "@/components/math-workbook/shared";

type RenderBlockModalFieldsOptions = {
  t: WorkbookTranslator;
  block: MathBlock;
  updateModalField: (key: string, value: string | string[]) => void;
  normalizeArithmeticCarryCells: (value: string) => string[];
};

export function renderBlockModalFields({
  t,
  block,
  updateModalField,
  normalizeArithmeticCarryCells
}: RenderBlockModalFieldsOptions): ReactNode {
  if (block.type === "fraction") {
    return (
      <div className="math-editor-grid">
        <label>
          <span>{t("modalFields.numerator")}</span>
          <input value={block.numerator} onChange={(event) => updateModalField("numerator", event.target.value)} placeholder="3x + 2" />
        </label>
        <label>
          <span>{t("modalFields.denominator")}</span>
          <input value={block.denominator} onChange={(event) => updateModalField("denominator", event.target.value)} placeholder="5" />
        </label>
        <label>
          <span>{t("modalFields.note")}</span>
          <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder={t("modalFields.fractionNotePlaceholder")} />
        </label>
      </div>
    );
  }

  if (block.type === "division") {
    return (
      <div className="math-editor-grid">
        <label>
          <span>{t("modalFields.divisor")}</span>
          <input value={block.divisor} onChange={(event) => updateModalField("divisor", event.target.value)} placeholder="7" />
        </label>
        <label>
          <span>{t("modalFields.quotient")}</span>
          <input value={block.quotient} onChange={(event) => updateModalField("quotient", event.target.value)} placeholder="35" />
        </label>
        <label className="wide-field">
          <span>{t("modalFields.dividendAndWork")}</span>
          <textarea value={block.work} onChange={(event) => updateModalField("work", event.target.value)} placeholder={"245\n21\n35\n0"} rows={4} />
        </label>
        <label className="wide-field">
          <span>{t("modalFields.note")}</span>
          <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder={t("modalFields.divisionNotePlaceholder")} />
        </label>
      </div>
    );
  }

  if (block.type === "addition" || block.type === "subtraction" || block.type === "multiplication") {
    return (
      <div className="math-editor-grid">
        <label>
          <span>{t("modalFields.firstTerm")}</span>
          <input value={block.top} onChange={(event) => updateModalField("top", event.target.value)} placeholder="245" />
        </label>
        <label>
          <span>{t("modalFields.secondTerm")}</span>
          <input value={block.bottom} onChange={(event) => updateModalField("bottom", event.target.value)} placeholder="37" />
        </label>
        <label>
          <span>{t("modalFields.result")}</span>
          <input value={block.result} onChange={(event) => updateModalField("result", event.target.value)} placeholder="282" />
        </label>
        <label>
          <span>{t("modalFields.carryTop")}</span>
          <input value={block.carryTop.join("")} onChange={(event) => updateModalField("carryTop", normalizeArithmeticCarryCells(event.target.value))} placeholder="1" />
        </label>
        <label>
          <span>{t("modalFields.carryMiddle")}</span>
          <input value={block.carryBottom.join("")} onChange={(event) => updateModalField("carryBottom", normalizeArithmeticCarryCells(event.target.value))} placeholder="2" />
        </label>
        <label>
          <span>{t("modalFields.carryBottom")}</span>
          <input value={block.carryResult.join("")} onChange={(event) => updateModalField("carryResult", normalizeArithmeticCarryCells(event.target.value))} placeholder="3" />
        </label>
        <label className="wide-field">
          <span>{t("modalFields.note")}</span>
          <input
            value={block.caption}
            onChange={(event) => updateModalField("caption", event.target.value)}
            placeholder={block.type === "addition" ? t("modalFields.additionNotePlaceholder") : block.type === "subtraction" ? t("modalFields.subtractionNotePlaceholder") : t("modalFields.multiplicationNotePlaceholder")}
          />
        </label>
      </div>
    );
  }

  if (block.type === "power") {
    return (
      <div className="math-editor-grid">
        <label>
          <span>{t("modalFields.base")}</span>
          <input value={block.base} onChange={(event) => updateModalField("base", event.target.value)} placeholder="2" />
        </label>
        <label>
          <span>{t("modalFields.exponent")}</span>
          <input value={block.exponent} onChange={(event) => updateModalField("exponent", event.target.value)} placeholder="3" />
        </label>
        <label>
          <span>{t("modalFields.note")}</span>
          <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder={t("modalFields.powerNotePlaceholder")} />
        </label>
      </div>
    );
  }

  return (
    <div className="math-editor-grid">
      <label>
        <span>{t("modalFields.radicand")}</span>
        <input value={block.radicand} onChange={(event) => updateModalField("radicand", event.target.value)} placeholder="49" />
      </label>
      <label className="wide-field">
        <span>{t("modalFields.note")}</span>
        <input value={block.caption} onChange={(event) => updateModalField("caption", event.target.value)} placeholder={t("modalFields.rootNotePlaceholder")} />
      </label>
    </div>
  );
}

type GraduatedLinePreviewOptions = {
  createGraduatedLineShape: (start: GeometryPointCoordinate, end: GeometryPointCoordinate, sections: number) => GeometryLinearShape;
  start: GeometryPointCoordinate;
  end: GeometryPointCoordinate;
  startValueInput: string;
  sectionsInput: string;
};

export function renderGraduatedLinePreview({
  createGraduatedLineShape,
  start,
  end,
  startValueInput,
  sectionsInput
}: GraduatedLinePreviewOptions): ReactNode {
  const sections = getGraduatedLineSectionCount(sectionsInput);
  const previewShape = {
    ...createGraduatedLineShape(start, end, sections),
    startValue: getGraduatedLineStartValue(startValueInput)
  };
  const rendered = getRenderedLinearGeometryPx(previewShape, 480, 120);
  const ticks = getGraduatedLineRenderTicks(previewShape, 480, 120);

  if (!rendered) {
    return null;
  }

  const startLabelPosition = getGraduatedLineLabelPosition(rendered.x1, rendered.y1, rendered.x2, rendered.y2, 0);
  const endLabelPosition = getGraduatedLineLabelPosition(rendered.x1, rendered.y1, rendered.x2, rendered.y2, 1);
  const points = [
    {x: rendered.x1, y: rendered.y1},
    {x: rendered.x2, y: rendered.y2},
    {x: startLabelPosition.x, y: startLabelPosition.y},
    {x: endLabelPosition.x, y: endLabelPosition.y},
    ...ticks.flatMap((tick) => [
      {x: tick.x1, y: tick.y1},
      {x: tick.x2, y: tick.y2}
    ])
  ];
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const contentWidth = Math.max(1, maxX - minX);
  const contentHeight = Math.max(1, maxY - minY);
  const scale = Math.min((480 - 32) / contentWidth, (120 - 24) / contentHeight, 1);
  const translateX = (480 - contentWidth * scale) / 2 - minX * scale;
  const translateY = (120 - contentHeight * scale) / 2 - minY * scale;

  return (
    <svg className="graduated-line-modal-preview-svg" viewBox="0 0 480 120" aria-hidden="true" focusable="false">
      <g transform={`translate(${translateX} ${translateY}) scale(${scale})`}>
        <line
          className="canvas-geometry-line canvas-geometry-graduated-line"
          x1={rendered.x1}
          y1={rendered.y1}
          x2={rendered.x2}
          y2={rendered.y2}
          stroke={previewShape.color}
          strokeWidth={Math.max(1.4, mmToPx(previewShape.strokeWidthMm))}
          strokeLinecap="round"
        />
        {ticks.map((tick, index) => (
          <line
            key={`graduated-line-preview-${index}`}
            className="canvas-geometry-graduated-line-tick"
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={previewShape.color}
            strokeWidth={tick.strokeWidth}
            strokeLinecap="round"
          />
        ))}
        <text
          className="canvas-geometry-measure canvas-geometry-graduated-line-label"
          x={startLabelPosition.x}
          y={startLabelPosition.y}
          textAnchor={startLabelPosition.textAnchor}
          dominantBaseline={startLabelPosition.dominantBaseline}
        >
          {getGraduatedLineEndpointLabel(previewShape, 0)}
        </text>
        <text
          className="canvas-geometry-measure canvas-geometry-graduated-line-label"
          x={endLabelPosition.x}
          y={endLabelPosition.y}
          textAnchor={endLabelPosition.textAnchor}
          dominantBaseline={endLabelPosition.dominantBaseline}
        >
          {getGraduatedLineEndpointLabel(previewShape, 1)}
        </text>
      </g>
    </svg>
  );
}

export function renderProtractorOverlay(
  vertex: GeometryPointCoordinate,
  baseline: GeometryPointCoordinate,
  end: GeometryPointCoordinate,
  tone: "draft" | "final" = "final"
): ReactNode {
  const {radius, baselineAngle, protractorPath, measuredArcPath} = getGeometryProtractorPaths(vertex, baseline, end);
  const delta = getGeometrySignedAngleDelta(vertex, baseline, end);
  const stepDirection = delta >= 0 ? 1 : -1;
  const degreeValue = Math.round(getGeometryAngleDegrees(vertex, baseline, end));
  const centerX = mmToPx(vertex.xMm);
  const centerY = mmToPx(vertex.yMm);
  const baselineX = mmToPx(baseline.xMm);
  const baselineY = mmToPx(baseline.yMm);
  const endX = mmToPx(end.xMm);
  const endY = mmToPx(end.yMm);

  return (
    <g className={`canvas-geometry-protractor canvas-geometry-protractor-${tone}`}>
      <path className="canvas-geometry-protractor-shell" d={protractorPath} />
      {Array.from({length: 19}, (_, index) => {
        const angle = baselineAngle + ((Math.PI / 18) * index * stepDirection);
        const outer = getGeometryPolarPoint(vertex, radius - 2, angle);
        const inner = getGeometryPolarPoint(vertex, index % 3 === 0 ? radius - 14 : radius - 8, angle);

        return (
          <line
            key={`tick-${tone}-${index}`}
            className="canvas-geometry-protractor-tick"
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
          />
        );
      })}
      <line className="canvas-geometry-protractor-ray" x1={centerX} y1={centerY} x2={baselineX} y2={baselineY} />
      <line className="canvas-geometry-protractor-ray" x1={centerX} y1={centerY} x2={endX} y2={endY} />
      <path className="canvas-geometry-protractor-arc" d={measuredArcPath} />
      <text className="canvas-geometry-measure" x={centerX} y={centerY - radius - 18} textAnchor="middle">
        {`${degreeValue}°`}
      </text>
    </g>
  );
}
