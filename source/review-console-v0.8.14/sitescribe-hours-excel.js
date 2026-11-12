/*
  SiteScribe Review Console v0.6.78
  Hours Report Excel export.

  Builds a genuine .xlsx workbook from the same normalized rows displayed by
  the live Hours Report. It does not read or change SiteScribe record data.
*/
(function SiteScribeHoursExcelModule(global) {
  "use strict";

  const COLORS = {
    navy: "17365D",
    blue: "D9EAF7",
    pale: "F5F8FB",
    line: "B8C7D9",
    text: "1F2937",
    muted: "5B6573",
    white: "FFFFFF"
  };

  function requireExcelJs() {
    if (!global.ExcelJS || typeof global.ExcelJS.Workbook !== "function") {
      throw new Error("Excel export library is unavailable.");
    }
    return global.ExcelJS;
  }

  function safeText(value, fallback = "") {
    const text = String(value == null ? "" : value).trim();
    return text || fallback;
  }

  function excelDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return safeText(value, "not stated");
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  }

  function styleLabel(cell) {
    cell.font = { bold: true, color: { argb: COLORS.muted }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.pale } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  }

  function styleValue(cell) {
    cell.font = { color: { argb: COLORS.text }, size: 10 };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  }

  function buildWorkbook(payload) {
    const ExcelJS = requireExcelJs();
    const workbook = new ExcelJS.Workbook();
    const meta = payload?.meta || {};
    const rows = Array.isArray(payload?.rows) ? payload.rows : [];
    const total = rows.reduce((sum, row) => sum + (Number(row?.hours) || 0), 0);

    workbook.creator = "SiteScribe Review Console";
    workbook.lastModifiedBy = "SiteScribe Review Console";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.calcProperties.fullCalcOnLoad = true;

    const sheet = workbook.addWorksheet("Hours Report", {
      views: [{ state: "frozen", ySplit: 7, showGridLines: false }],
      pageSetup: {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        paperSize: 9,
        margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }
      }
    });

    sheet.properties.defaultRowHeight = 18;
    sheet.columns = [
      { key: "date", width: 14 },
      { key: "category", width: 17 },
      { key: "primary", width: 34 },
      { key: "secondary", width: 48 },
      { key: "start", width: 15 },
      { key: "end", width: 15 },
      { key: "hours", width: 13 },
      { key: "status", width: 12 }
    ];

    sheet.mergeCells("A1:H1");
    sheet.getCell("A1").value = safeText(meta.site, "Unnamed Site");
    sheet.getCell("A1").font = { bold: true, size: 18, color: { argb: COLORS.white } };
    sheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.navy } };
    sheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
    sheet.getRow(1).height = 28;

    sheet.mergeCells("A2:H2");
    sheet.getCell("A2").value = safeText(meta.title, "Hours Report — Secondary Records");
    sheet.getCell("A2").font = { bold: true, size: 13, color: { argb: COLORS.navy } };
    sheet.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.blue } };
    sheet.getCell("A2").alignment = { vertical: "middle", horizontal: "left" };
    sheet.getRow(2).height = 23;

    const summary = [
      ["A4", "Date Range", "B4:D4", safeText(meta.dateRange, "All dates")],
      ["E4", "Generated", "F4:H4", safeText(meta.generatedAt, "not stated")],
      ["A5", "Filters", "B5:D5", safeText(meta.filters, "All categories · Open and Closed")],
      ["E5", "Report Summary", "F5:H5", safeText(meta.countSummary, `${rows.length} selected records · Total Hours: ${total}`)]
    ];
    summary.forEach(([labelCell, label, valueRange, value]) => {
      sheet.getCell(labelCell).value = label;
      styleLabel(sheet.getCell(labelCell));
      sheet.mergeCells(valueRange);
      const valueCell = sheet.getCell(valueRange.split(":")[0]);
      valueCell.value = value;
      styleValue(valueCell);
    });
    sheet.getRow(4).height = 24;
    sheet.getRow(5).height = 30;

    const headers = ["Date", "Category", "Primary Record", "Secondary Update", "Start Time", "End Time", "Total Hours", "Status"];
    sheet.getRow(7).values = headers;
    sheet.getRow(7).height = 24;
    sheet.getRow(7).eachCell(cell => {
      cell.font = { bold: true, color: { argb: COLORS.white }, size: 10 };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.navy } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = { bottom: { style: "medium", color: { argb: COLORS.navy } } };
    });

    rows.forEach((item, index) => {
      const row = sheet.addRow({
        date: excelDate(item?.date),
        category: safeText(item?.category, "not stated"),
        primary: safeText(item?.primary, "Untitled record"),
        secondary: safeText(item?.secondary, "Untitled update"),
        start: safeText(item?.start, "-"),
        end: safeText(item?.end, "-"),
        hours: Number(item?.hours) || 0,
        status: safeText(item?.status, "Open")
      });
      row.height = 34;
      row.eachCell(cell => {
        cell.font = { color: { argb: COLORS.text }, size: 10 };
        cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
        cell.border = { bottom: { style: "thin", color: { argb: COLORS.line } } };
        if (index % 2 === 1) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.pale } };
        }
      });
      if (row.getCell(1).value instanceof Date) row.getCell(1).numFmt = "yyyy-mm-dd";
      row.getCell(5).alignment = { vertical: "top", horizontal: "center" };
      row.getCell(6).alignment = { vertical: "top", horizontal: "center" };
      row.getCell(7).numFmt = "0.00";
      row.getCell(7).alignment = { vertical: "top", horizontal: "right" };
      row.getCell(8).alignment = { vertical: "top", horizontal: "center" };
    });

    const firstDataRow = 8;
    const lastDataRow = firstDataRow + rows.length - 1;
    if (rows.length) sheet.autoFilter = { from: "A7", to: `H${lastDataRow}` };

    const totalRowNumber = Math.max(firstDataRow, lastDataRow + 2);
    sheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`);
    sheet.getCell(`A${totalRowNumber}`).value = "Cumulative Total Hours";
    sheet.getCell(`A${totalRowNumber}`).font = { bold: true, color: { argb: COLORS.navy }, size: 11 };
    sheet.getCell(`A${totalRowNumber}`).alignment = { vertical: "middle", horizontal: "right" };
    sheet.getCell(`G${totalRowNumber}`).value = rows.length
      ? { formula: `SUM(G${firstDataRow}:G${lastDataRow})`, result: total }
      : 0;
    sheet.getCell(`G${totalRowNumber}`).numFmt = "0.00";
    sheet.getCell(`G${totalRowNumber}`).font = { bold: true, color: { argb: COLORS.white }, size: 12 };
    sheet.getCell(`G${totalRowNumber}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.navy } };
    sheet.getCell(`G${totalRowNumber}`).alignment = { vertical: "middle", horizontal: "right" };
    sheet.getCell(`H${totalRowNumber}`).value = "hrs";
    sheet.getCell(`H${totalRowNumber}`).font = { bold: true, color: { argb: COLORS.white }, size: 11 };
    sheet.getCell(`H${totalRowNumber}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.navy } };
    sheet.getCell(`H${totalRowNumber}`).alignment = { vertical: "middle", horizontal: "left" };
    sheet.getRow(totalRowNumber).height = 25;

    const noteRow = totalRowNumber + 2;
    sheet.mergeCells(`A${noteRow}:H${noteRow}`);
    sheet.getCell(`A${noteRow}`).value = "0 hours indicates no hours were recorded for that entry.";
    sheet.getCell(`A${noteRow}`).font = { italic: true, color: { argb: COLORS.muted }, size: 9 };
    sheet.getCell(`A${noteRow}`).alignment = { vertical: "middle", horizontal: "left" };

    sheet.headerFooter.oddFooter = `&LSiteScribe ${safeText(meta.appVersion, "")}&RPage &P of &N`;
    sheet.printArea = `A1:H${noteRow}`;
    return workbook;
  }

  async function exportWorkbook(payload) {
    const workbook = buildWorkbook(payload);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = safeText(payload?.filename, "SiteScribe_Hours_Report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { rowCount: Array.isArray(payload?.rows) ? payload.rows.length : 0 };
  }

  global.SiteScribeHoursExcel = { buildWorkbook, exportWorkbook };
})(typeof window !== "undefined" ? window : globalThis);
