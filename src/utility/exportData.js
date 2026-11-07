
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
}) {
  const reportDetails = [
    ["Report", title],
    ["Description", subtitle],
    ["Exported at (UTC)", new Date().toISOString()],
    ["Record count", rows.length],
    ...Object.entries(metadata),
  ];

  const content = [
    ["CIVICINTEL — NIGERIA DATA PLATFORM"],
    [],
    ...reportDetails,
    [],
    headers,
    ...rows.map((row) =>
      headers.map((header) => row[header] ?? "")
    ),
  ]
    .map((row) => row.map(escapeCSV).join(","))
    .join("\r\n");

  downloadFile(
    "\uFEFF" + content,
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
}) {
  const workbook = XLSX.utils.book_new();

  // Main worksheet containing the exported records.
  const dataSheet = XLSX.utils.aoa_to_sheet([
    ["CIVICINTEL — NIGERIA DATA PLATFORM"],
    [],
    headers,
    ...rows.map((row) =>
      headers.map((header) => row[header] ?? "")
    ),
  ]);

  // Make column widths readable.
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

  dataSheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: headers.length - 1 },
      },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    dataSheet,
    "Records"
  );

  // Separate worksheet for report details and provenance.
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

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

function formatPDF({
  headers,
  rows,
  fileName,
  title,
  subtitle = "",
  metadata = {},
  landscape = true,
}) {
  const doc = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(16);
  doc.setTextColor(11, 60, 93);
  doc.text(title, 14, 16);

  let y = 24;

  doc.setFontSize(10);
  doc.setTextColor(60, 70, 80);

  if (subtitle) {
    const subtitleLines = doc.splitTextToSize(
      subtitle,
      doc.internal.pageSize.getWidth() - 28
    );

    doc.text(subtitleLines, 14, y);
    y += subtitleLines.length * 5 + 2;
  }

  const metadataLines = Object.entries(metadata).map(
    ([key, value]) => `${key}: ${value}`
  );

  metadataLines.push(
    `Exported at (UTC): ${new Date().toISOString()}`,
    `Record count: ${rows.length}`
  );

  if (metadataLines.length) {
    const lines = doc.splitTextToSize(
      metadataLines.join(" | "),
      doc.internal.pageSize.getWidth() - 28
    );

    doc.text(lines, 14, y);
    y += lines.length * 5 + 2;
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
