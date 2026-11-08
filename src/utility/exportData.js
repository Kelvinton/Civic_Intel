
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



function formatPDF({
  headers,
  rows,
  fileName,
  title,
  subtitle = "",
  metadata = {},
  summary = [],
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
    doc.text("COMPARISON DATA", 14, y);

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

  autoTable(doc, {
    head: [headers],
    body: rows.map((row) =>
      headers.map((header) => {
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
 *
 * This utility accepts data from either a demo dataset or an API.
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
