
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function formatValue(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 2,
  }).format(number);
}

export function formatDisplayValue(value, unit = "") {
  const formattedValue = formatValue(value);

  if (formattedValue === "—") {
    return formattedValue;
  }

  const normalizedUnit = String(unit).trim();

  if (normalizedUnit === "%") {
    return `${formattedValue}%`;
  }

  return normalizedUnit
    ? `${formattedValue} ${normalizedUnit}`
    : formattedValue;
}

function downloadFile(content, type, fileName) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCSV(value) {
  const safeValue =
    value !== null && typeof value === "object"
      ? JSON.stringify(value)
      : String(value ?? "");

  return `"${safeValue.replace(/"/g, '""')}"`;
}

function drawPDFWatermarkPage(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(238, 241, 243);

  doc.setFontSize(11);

  const spacingX = 125;
  const spacingY = 65;

  for (
    let y = -20;
    y < pageHeight + 40;
    y += spacingY
  ) {
    for (
      let x = -30;
      x < pageWidth + 40;
      x += spacingX
    ) {
      doc.text("CIVICINTEL | NIGERIA DATA PLATFORM", x, y, {
        angle: -35,
      });
    }
  }
}

function formatCSV({
  headers,
  rows,
  fileName,
  title,
  subtitle = "",
  metadata = {},
  summary = [],
}) {
  const hasSummary = summary.length > 0;

  const content = hasSummary
    ? [
        [title],
        [subtitle],
        [],
        ["STATE SUMMARY"],
        ...summary,
        [],
        ["COMPARISON DATA"],
        headers,
        ...rows.map((row) =>
          headers.map((header) => row[header] ?? "")
        ),
      ]
    : [
        ["CIVICINTEL — NIGERIA DATA PLATFORM"],
        [],
        ["Report", title],
        ["Description", subtitle],
        ["Exported at (UTC)", new Date().toISOString()],
        ["Record count", rows.length],
        ...Object.entries(metadata),
        [],
        headers,
        ...rows.map((row) =>
          headers.map((header) => row[header] ?? "")
        ),
      ];

  const csvContent = content
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  downloadFile(
    "\uFEFF" + csvContent,
    "text/csv;charset=utf-8;",
    `${fileName}.csv`
  );
}

function formatExcel({
  headers,
  rows,
  fileName,
  title,
  subtitle = "",
  metadata = {},
  summary = [],
}) {
  const workbook = XLSX.utils.book_new();

  const hasSummary = summary.length > 0;

  const sheetRows = hasSummary
    ? [
        [title],
        [subtitle],
        [],
        ["STATE SUMMARY"],
        ...summary,
        [],
        ["COMPARISON DATA"],
        headers,
        ...rows.map((row) =>
          headers.map((header) => row[header] ?? "")
        ),
      ]
    : [
        ["CIVICINTEL — NIGERIA DATA PLATFORM"],
        [],
        headers,
        ...rows.map((row) =>
          headers.map((header) => row[header] ?? "")
        ),
      ];

  const dataSheet = XLSX.utils.aoa_to_sheet(sheetRows);

  dataSheet["!cols"] = headers.map((header) => {
    const longestValue = Math.max(
      String(header).length,
      ...rows.map((row) =>
        String(row[header] ?? "").length
      )
    );

    return {
      wch: Math.min(Math.max(longestValue + 2, 12), 40),
    };
  });

  if (hasSummary) {
    dataSheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 },
      },
      {
        s: { r: 1, c: 0 },
        e: { r: 1, c: headers.length - 1 },
      },
      {
        s: { r: 3, c: 0 },
        e: { r: 3, c: headers.length - 1 },
      },
      {
        s: { r: 5 + summary.length, c: 0 },
        e: { r: 5 + summary.length, c: headers.length - 1 },
      },
    ];
  } else {
    dataSheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 },
      },
    ];
  }

  XLSX.utils.book_append_sheet(
    workbook,
    dataSheet,
    hasSummary ? "Comparison Report" : "Records"
  );

  if (!hasSummary) {
    const metadataRows = [
      ["Report", title],
      ["Description", subtitle],
      ["Exported at (UTC)", new Date().toISOString()],
      ["Record count", rows.length],
      ...Object.entries(metadata),
    ];

    const metadataSheet = XLSX.utils.aoa_to_sheet([
      ["CIVICINTEL — NIGERIA DATA PLATFORM"],
      [],
      ["Property", "Value"],
      ...metadataRows,
    ]);

    metadataSheet["!cols"] = [
      { wch: 25 },
      { wch: 65 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      metadataSheet,
      "Report Details"
    );
  }

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}


function drawPDFChart(
  doc,
  chartData,
  chartTitle,
  chartUnit,
  startY,
  chartColors = []
) {
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return startY;
  }

  const validPeriods = chartData
    .map((period) => ({
      ...period,
      rows: (period.rows ?? []).filter(
        (row) =>
          row.value !== null &&
          row.value !== undefined &&
          String(row.value).trim() !== "" &&
          Number.isFinite(Number(row.value))
      ),
    }))
    .filter((period) => period.rows.length > 0);

  if (validPeriods.length === 0) {
    return startY;
  }

  const pageWidth = doc.internal.pageSize.getWidth();

  // Use the same year colour order as the website.
  const defaultColors = [
    [11, 60, 93],   // Navy
    [31, 122, 63],  // Green
    [214, 167, 86], // Gold
    [124, 58, 237], // Purple
  ];

  const colors =
    Array.isArray(chartColors) && chartColors.length > 0
      ? chartColors
      : defaultColors;

  // Get the states in the order they appear in the data.
  const states = [
    ...new Set(
      validPeriods.flatMap((period) =>
        period.rows.map((row) => row.state)
      )
    ),
  ];

  const allValues = validPeriods.flatMap((period) =>
    period.rows.map((row) => Number(row.value))
  );

  const maxValue = Math.max(...allValues, 0);

  if (maxValue <= 0) {
    return startY;
  }

  // Chart dimensions.
  const chartLeft = 47;
  const chartRight = pageWidth - 35;
  const chartTop = startY + 25;

  const plotWidth = chartRight - chartLeft;

  const pageHeight = doc.internal.pageSize.getHeight();

  const availableChartHeight = pageHeight - chartTop - 32;

  const chartHeight = Math.min(
    states.length * 10.5,
    availableChartHeight
  );

  const chartBottom = chartTop + chartHeight;
  const plotHeight = chartBottom - chartTop;

  // Chart title.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(11, 60, 93);

  doc.text(
    chartTitle || "State Comparison",
    14,
    startY + 7
  );

  // Unit.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 100, 110);

  if (chartUnit) {
    doc.text(`Unit: ${chartUnit}`, 14, startY + 13);
  }

  // Horizontal grouped bars, with states on the vertical axis.
  const groupHeight = plotHeight / states.length;

  const barGap = 1.2;
  const stateGroupGap = 2.5;

  const barHeight = Math.min(
    5,
    (
      groupHeight -
      stateGroupGap -
      (validPeriods.length - 1) * barGap
    ) / validPeriods.length
  );

  // Draw vertical grid lines and horizontal-axis labels.
  for (let i = 0; i <= 4; i++) {
    const value = (maxValue / 4) * i;
    const x = chartLeft + (plotWidth / 4) * i;

    doc.setDrawColor(220, 225, 230);
    doc.line(x, chartTop, x, chartBottom);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(90, 100, 110);

    doc.text(
      formatValue(value),
      x,
      chartBottom + 6,
      { align: "center" }
    );
  }

  // Draw each state's group of year bars.
  states.forEach((state, stateIndex) => {
    const groupCenter =
      chartTop + groupHeight * (stateIndex + 0.5);

    // State labels on the vertical axis.
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(60, 70, 80);

    doc.text(
      state,
      chartLeft - 4,
      groupCenter + 1,
      { align: "right" }
    );

    validPeriods.forEach((period, periodIndex) => {
      const row = period.rows.find(
        (item) => item.state === state
      );

      if (!row) return;

      const value = Number(row.value);

      const color =
  row.color ||
  period.color ||
  colors[periodIndex % colors.length];

      const totalBarsHeight =
        validPeriods.length * barHeight +
        (validPeriods.length - 1) * barGap;

      const firstBarY =
        groupCenter - totalBarsHeight / 2;

      const barY =
        firstBarY +
        periodIndex * (barHeight + barGap);

      const barWidth = (value / maxValue) * plotWidth;

      // Draw the year-specific bar.
      doc.setFillColor(...color);

      doc.roundedRect(
        chartLeft,
        barY,
        Math.max(barWidth, 0.5),
        barHeight,
        0.8,
        0.8,
        "F"
      );

      // Display the value and its unit beside the bar.
      const displayValue = formatDisplayValue(
        value,
        chartUnit
      );

      const labelX = chartLeft + barWidth + 2;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);

      if (labelX + doc.getTextWidth(displayValue) > chartRight) {
      // Always display the figure outside the bar.
      doc.setTextColor(51, 65, 85);

      doc.text(
        displayValue,
        labelX,
        barY + barHeight - 0.3
      );
} else {
  // Keep labels outside the bar in dark text.
  doc.setTextColor(51, 65, 85);

  doc.text(
    displayValue,
    labelX,
    barY + barHeight - 0.3
  );
}
    });
  });

  // Legend: one colour for each year.
  const legendItems = validPeriods.map(
    (period, index) => ({
      label: String(period.year),
      color:
        period.rows[0]?.color ||
        period.color ||
        colors[index % colors.length],
    })
  );

  // Legend heading.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(11, 60, 93);

  doc.text("Reporting Year", 14, chartBottom + 15);

  // Legend entries.
  let legendX = 14;
  let legendY = chartBottom + 23;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  legendItems.forEach((item) => {
    const labelWidth = doc.getTextWidth(item.label) + 12;

    if (legendX + labelWidth > pageWidth - 14) {
      legendX = 14;
      legendY += 8;
    }

    doc.setFillColor(...item.color);
    doc.rect(legendX, legendY - 3, 3, 3, "F");

    doc.setTextColor(60, 70, 80);
    doc.text(item.label, legendX + 5, legendY);

    legendX += labelWidth;
  });

  return legendY + 5;
}


// Transform repeated state/year records into a comparison table.
// Each state gets one row, with a separate column for each year.
function createYearPivot(headers, rows) {
  const findHeader = (name) =>
    headers.find(
      (header) =>
        String(header).trim().toLowerCase() === name
    );

  const stateHeader = findHeader("state");
  const yearHeader = findHeader("year");
  const valueHeader = findHeader("value");
  const indicatorHeader = findHeader("indicator");

  // Only pivot data with the required columns.
  if (!stateHeader || !yearHeader || !valueHeader) {
    return null;
  }

  // Avoid combining different indicators into one table.
  if (indicatorHeader) {
    const indicators = new Set(
      rows.map((row) =>
        String(row[indicatorHeader] ?? "").trim()
      )
    );

    if (indicators.size > 1) {
      return null;
    }
  }

  // Collect and sort the selected years.
  const years = [
    ...new Set(
      rows
        .map((row) =>
          String(row[yearHeader] ?? "").trim()
        )
        .filter(Boolean)
    ),
  ].sort((a, b) => Number(a) - Number(b));

  // Collect unique states.
  const states = [
    ...new Set(
      rows
        .map((row) =>
          String(row[stateHeader] ?? "").trim()
        )
        .filter(Boolean)
    ),
  ];

  const valuesByState = new Map();

  for (const row of rows) {
    const state = String(row[stateHeader] ?? "").trim();
    const year = String(row[yearHeader] ?? "").trim();

    if (!state || !year) continue;

    if (!valuesByState.has(state)) {
      valuesByState.set(state, {});
    }

    valuesByState.get(state)[year] =
      row[valueHeader] ?? "—";
  }

  // Create the new table headers.
  const pivotHeaders = ["State", ...years];

  // Create one row per state.
  const pivotRows = states.map((state) => {
    const stateValues = valuesByState.get(state) ?? {};

    return {
      State: state,
      ...Object.fromEntries(
        years.map((year) => [
          year,
          stateValues[year] ?? "—",
        ])
      ),
    };
  });

  return {
    headers: pivotHeaders,
    rows: pivotRows,
  };
}

function formatPDF({
  headers,
  rows,
  fileName,
  title,
  subtitle = "",
  metadata = {},
  summary = [],
  chartData = [],
  chartTitle = "",
  chartUnit = "",
  chartColors = [],
  landscape = true,
}) {
  const doc = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });
  const watermarkedPages = new Set();

  const drawWatermarkOnce = () => {
    const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;

    if (watermarkedPages.has(pageNumber)) return;

    drawPDFWatermarkPage(doc);
    watermarkedPages.add(pageNumber);
  };

  drawWatermarkOnce();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(11, 60, 93);
  doc.text(title, 14, 17);

  let y = 25;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(60, 70, 80);

  if (subtitle) {
    doc.text(subtitle, 14, y);
    y += 8;
  }

  if (summary.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 60, 93);
    doc.text("STATE SUMMARY", 14, y);

    autoTable(doc, {
      body: summary,
      startY: y + 3,
      margin: { left: 14, right: 14 },
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
      },
      willDrawPage: drawWatermarkOnce,
    });

    y = doc.lastAutoTable.finalY + 10;
  } else {
    const metadataLines = Object.entries(metadata).map(
      ([key, value]) => `${key}: ${value}`
    );

    metadataLines.push(
      `Exported at (UTC): ${new Date().toISOString()}`,
      `Record count: ${rows.length}`
    );

    if (metadataLines.length > 0) {
      doc.setFontSize(9);

      const lines = doc.splitTextToSize(
        metadataLines.join(" | "),
        doc.internal.pageSize.getWidth() - 28
      );

      doc.text(lines, 14, y);
      y += lines.length * 5 + 2;
    }
  }

  // Add the visual comparison chart below the State Summary.
  if (chartData.length > 0) {
    drawPDFChart(
      doc,
      chartData,
      chartTitle,
      chartUnit,
      y,
      chartColors
    );

    // Start the detailed table on a fresh page.
    doc.addPage();
    drawWatermarkOnce();

    y = 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 60, 93);

    doc.text("COMPARISON DATA", 14, y);

    y += 3;
  }

  // Prepare the year-grouped table where possible.
  const pivotedData = createYearPivot(headers, rows);

  const tableHeaders = pivotedData?.headers ?? headers;
  const tableRows = pivotedData?.rows ?? rows;

  // Generate the PDF data table.
  autoTable(doc, {
    head: [tableHeaders],
    rowPageBreak: "avoid",
    body: tableRows.map((row) =>
      tableHeaders.map((header) => {
        const value = row[header];

        const isValueColumn =
          String(header).trim().toLowerCase() === "value" ||
          /^\d{4}$/.test(String(header).trim());

        if (
          isValueColumn &&
          chartUnit &&
          value !== null &&
          value !== undefined &&
          String(value).trim() !== "" &&
          Number.isFinite(Number(value))
        ) {
          return formatDisplayValue(value, chartUnit);
        }

        return value !== null && typeof value === "object"
          ? JSON.stringify(value)
          : String(value ?? "");
      })
    ),
    startY: y + 2,
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [11, 60, 93],
    },
    alternateRowStyles: {
      fillColor: [240, 245, 247],
    },
    willDrawPage: drawWatermarkOnce,
  });

  doc.save(`${fileName}.pdf`);
}

/**
 * Shared CivicIntel export utility.
 *
 * format: "csv", "pdf", or "xlsx"
 * headers: array of column labels
 * rows: array of objects keyed by those labels
 * metadata: optional report and data provenance information
 * The calling page is responsible for supplying accurate records
 * and truthful source/verification metadata.
 */
export function exportData({
  format,
  headers,
  rows,
  fileName = "civicintel-export",
  title = "CivicIntel Data Export",
  subtitle = "",
  metadata = {},
  summary = [],
  chartData = [],
  chartColors = [],
  chartTitle = "",
  chartUnit = "",
  landscape = true,
}) {
  if (!Array.isArray(headers) || headers.length === 0) {
    throw new Error(
      "Export requires at least one column header."
    );
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("There are no records to export.");
  }

  const safeFileName = fileName
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-");

  const options = {
    headers,
    rows,
    fileName: safeFileName,
    title,
    subtitle,
    metadata,
    summary,
    chartData,
    chartTitle,
    chartUnit,
    chartColors,
    landscape,
  };

  switch (String(format).toLowerCase()) {
    case "csv":
      formatCSV(options);
      break;

    case "pdf":
      formatPDF(options);
      break;

    case "xlsx":
    case "excel":
      formatExcel(options);
      break;

    default:
      throw new Error(
        `Unsupported export format: ${format}`
      );
  }
}
