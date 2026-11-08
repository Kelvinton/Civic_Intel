
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

function addPDFWatermark(doc) {
  const pageCount = doc.internal.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(150, 165, 175);

    // Top branding
    doc.text(
      "CIVICINTEL | NIGERIA DATA PLATFORM",
      pageWidth / 2,
      8,
      { align: "center" }
    );

    // Bottom branding
    doc.text(
      "CIVICINTEL | NIGERIA DATA PLATFORM",
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
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

function drawPDFChart(doc, chartData, chartTitle, chartUnit, startY) {
  if (!Array.isArray(chartData) || chartData.length === 0) {
    return startY;
  }

  const validPeriods = chartData.filter(
    (period) => period.rows?.length > 0
  );

  if (validPeriods.length === 0) {
    return startY;
  }

  const pageWidth = doc.internal.pageSize.getWidth();

  const colors = [
    [11, 60, 93],
    [31, 122, 63],
    [214, 166, 87],
    [76, 110, 145],
    [135, 91, 145],
    [205, 112, 75],
    [85, 135, 125],
    [120, 120, 120],
  ];

  const states = [
    ...new Set(
      validPeriods.flatMap((period) =>
        period.rows.map((row) => row.state)
      )
    ),
  ];

  const allValues = validPeriods.flatMap((period) =>
    period.rows.map((row) => row.value)
  );

  const maxValue = Math.max(...allValues, 0);

  if (maxValue <= 0) {
    return startY;
  }

  const chartTop = startY + 23;
  const chartBottom = startY + 90;
  const chartLeft = 35;
  const chartRight = pageWidth - 18;
  const plotWidth = chartRight - chartLeft;
  const plotHeight = chartBottom - chartTop;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(11, 60, 93);
  doc.text(chartTitle || "State Comparison", 14, startY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 100, 110);

  if (chartUnit) {
    doc.text(`Unit: ${chartUnit}`, 14, startY + 13);
  }

  // Horizontal grid lines and value labels.
  for (let i = 0; i <= 4; i++) {
    const value = (maxValue / 4) * i;
    const y = chartBottom - (plotHeight / 4) * i;

    doc.setDrawColor(220, 225, 230);
    doc.line(chartLeft, y, chartRight, y);

    doc.setFontSize(7);
    doc.text(
      formatValue(value),
      chartLeft - 3,
      y + 1,
      { align: "right" }
    );
  }

  const groupWidth = plotWidth / validPeriods.length;
  const barWidth = Math.min(
    8,
    groupWidth / Math.max(states.length * 1.5, 2)
  );

  validPeriods.forEach((period, periodIndex) => {
    const groupCenter =
      chartLeft + groupWidth * (periodIndex + 0.5);

    period.rows.forEach((row) => {
      const stateIndex = states.indexOf(row.state);
      const barHeight = (row.value / maxValue) * plotHeight;

      const x =
        groupCenter -
        (states.length * barWidth) / 2 +
        stateIndex * barWidth;

      const y = chartBottom - barHeight;

      doc.setFillColor(
        ...colors[stateIndex % colors.length]
      );

      doc.rect(
        x,
        y,
        Math.max(barWidth - 0.8, 1),
        barHeight,
        "F"
      );
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 70, 80);

    doc.text(
      String(period.year),
      groupCenter,
      chartBottom + 7,
      { align: "center" }
    );
  });

  // State legend.
  let legendX = 14;
  let legendY = chartBottom + 17;
  doc.setFontSize(8);

  states.forEach((state, index) => {
    const color = colors[index % colors.length];

    const labelWidth = doc.getTextWidth(state) + 12;

    if (legendX + labelWidth > pageWidth - 14) {
      legendX = 14;
      legendY += 8;
    }

    doc.setFillColor(...color);
    doc.rect(legendX, legendY - 3, 3, 3, "F");

    doc.setTextColor(60, 70, 80);
    doc.text(state, legendX + 5, legendY);

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
  landscape = true,
}) {
  const doc = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

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
    });

    y = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(11, 60, 93);
    doc.text("VISUAL COMPARISON", 14, y);

    y += 3;
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

  // Add the visual comparison chart before the data table.
  if (chartData.length > 0) {
    const pageHeight = doc.internal.pageSize.getHeight();

    // Move the chart to a fresh page if there isn't enough room.
    if (y + 110 > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }

    drawPDFChart(
      doc,
      chartData,
      chartTitle,
      chartUnit,
      y
    );

    // Start the detailed table on a fresh page.
    doc.addPage();
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
  });

  addPDFWatermark(doc);

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
