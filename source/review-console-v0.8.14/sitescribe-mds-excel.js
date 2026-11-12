/*
  SiteScribe Review Console v0.7.19
  MDS monthly billing export. It builds an MDS-style Saturday–Friday weekly
  timesheet tab for every week covered by selected Reg/OT hour blocks, plus a
  final Expenses Summary tab for separately tagged expense lines.
*/
(function SiteScribeMdsExcelModule(global) {
  "use strict";

  const FIXED = {
    employee: "Frank Sved, ECR Inc.",
    project: "1097",
    purchaseOrder: "17280",
    regularDescription: "ON SITE SUPPORT - Regular Time",
    overtimeDescription: "ON SITE SUPPORT - Over Time"
  };
  const COLORS = { ink: "5E639A", red: "FF0000", grey: "BFBFBF", blue: "17365D", paleBlue: "D9EAF7", white: "FFFFFF", line: "252525", pale: "F5F8FB" };

  function excel() {
    if (!global.ExcelJS || typeof global.ExcelJS.Workbook !== "function") throw new Error("Excel export library is unavailable.");
    return global.ExcelJS;
  }

  function isoDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
  }

  function isoText(date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  }

  function addDays(date, count) {
    const copy = new Date(date.getTime());
    copy.setUTCDate(copy.getUTCDate() + count);
    return copy;
  }

  function weekStart(date) { return addDays(date, -((date.getUTCDay() + 1) % 7)); }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", day: "2-digit", month: "short", year: "numeric" }).format(date);
  }

  function formatMonth(date) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", month: "long", year: "numeric" }).format(date);
  }

  function columnLetter(number) {
    let value = number, result = "";
    while (value) { const remainder = (value - 1) % 26; result = String.fromCharCode(65 + remainder) + result; value = Math.floor((value - 1) / 26); }
    return result;
  }

  function border() {
    const side = { style: "thin", color: { argb: COLORS.line } };
    return { top: side, left: side, bottom: side, right: side };
  }

  function applyBorder(sheet, range) {
    const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    if (!match) return;
    const startCol = columnNumber(match[1]), startRow = Number(match[2]), endCol = columnNumber(match[3]), endRow = Number(match[4]);
    for (let row = startRow; row <= endRow; row++) for (let col = startCol; col <= endCol; col++) sheet.getCell(row, col).border = border();
  }

  function columnNumber(letters) {
    return String(letters).split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0);
  }

  function merged(sheet, range, value, options = {}) {
    sheet.mergeCells(range);
    const cell = sheet.getCell(range.split(":")[0]);
    cell.value = value;
    cell.font = options.font || { name: "Arial", size: 10, color: { argb: COLORS.ink } };
    cell.alignment = options.alignment || { vertical: "middle", horizontal: "left", wrapText: true };
    if (options.fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: options.fill } };
    return cell;
  }

  function setHeaderCell(cell, value, fill) {
    cell.value = value;
    cell.font = { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    if (fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
  }

  function createTimesheet(workbook, start, rows) {
    const end = addDays(start, 6);
    const sheet = workbook.addWorksheet(`Week ending ${isoText(end)}`, {
      views: [{ showGridLines: false }],
      pageSetup: { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.25, right: 0.25, top: 0.35, bottom: 0.35, header: 0.1, footer: 0.1 } }
    });
    sheet.properties.defaultRowHeight = 19;
    [31, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 10, 9, 9, 9].forEach((width, index) => sheet.getColumn(index + 1).width = width);

    merged(sheet, "H1:N2", "WEEKLY TIME SHEET", { font: { name: "Arial", bold: true, size: 20, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "O1:P1", "FROM:", { font: { name: "Arial", bold: true, size: 12, color: { argb: COLORS.ink } } });
    merged(sheet, "Q1:R1", formatDate(start), { font: { name: "Arial", bold: true, size: 12, color: { argb: COLORS.ink } }, alignment: { horizontal: "right", vertical: "middle" } });
    merged(sheet, "O2:P2", "TO:", { font: { name: "Arial", bold: true, size: 12, color: { argb: COLORS.ink } } });
    merged(sheet, "Q2:R2", formatDate(end), { font: { name: "Arial", bold: true, size: 12, color: { argb: COLORS.red } }, alignment: { horizontal: "right", vertical: "middle" } });
    merged(sheet, "A3:B3", "EMPLOYEE NAME:", { font: { name: "Arial", bold: true, size: 11, color: { argb: COLORS.ink } } });
    merged(sheet, "C3:G3", FIXED.employee, { font: { name: "Arial", bold: true, size: 12, color: { argb: COLORS.red } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "H3:N3", "DEPARTMENT NO:", { font: { name: "Arial", bold: true, size: 11, color: { argb: COLORS.ink } } });
    merged(sheet, "O3:P3", "EMP #:", { font: { name: "Arial", bold: true, size: 11, color: { argb: COLORS.ink } } });
    merged(sheet, "Q3:R3", "N/A", { font: { name: "Arial", bold: true, size: 12, color: { argb: COLORS.red } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "A4:G4", "EMPLOYEE SIGNATURE:", { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } } });
    merged(sheet, "H4:R4", "SUPERVISOR'S SIGNATURE:", { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } } });
    applyBorder(sheet, "A3:R4"); applyBorder(sheet, "O1:R3");

    merged(sheet, "A5:B6", "WORK DESCRIPTION", { font: { name: "Arial", bold: true, size: 11, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "C5:G5", "CHARGE CODE", { font: { name: "Arial", bold: true, size: 11, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "C6:D6", "Project", { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "E6:F6", "Task", { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "G6:G6", "G/L", { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    ["SAT", "SUN", "MON", "TUES", "WED", "THU", "FRI"].forEach((label, index) => setHeaderCell(sheet.getCell(5, 8 + index), `${label}\n${String(addDays(start, index).getUTCDate()).padStart(2, "0")}`));
    merged(sheet, "O5:O6", "TOTAL\nHOURS", { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle", wrapText: true } });
    merged(sheet, "P5:Q6", "ADMIN", { fill: COLORS.grey, font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    merged(sheet, "R5:R6", "PHASE", { fill: COLORS.grey, font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    applyBorder(sheet, "A5:R6");

    const details = [[7, "regular", FIXED.regularDescription], [9, "overtime", FIXED.overtimeDescription]];
    details.forEach(([rowNumber, type, description]) => {
      merged(sheet, `A${rowNumber}:B${rowNumber}`, description, { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } } });
      merged(sheet, `C${rowNumber}:D${rowNumber}`, Number(FIXED.project), { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
      const dayHours = Array(7).fill(0);
      rows.filter(row => row.hourType === type).forEach(row => { const date = isoDate(row.date); if (date) dayHours[Math.floor((date.getTime() - start.getTime()) / 86400000)] += Number(row.hours) || 0; });
      dayHours.forEach((hours, index) => { const cell = sheet.getCell(rowNumber, 8 + index); cell.value = hours || null; cell.numFmt = "0.00"; cell.font = { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }; cell.alignment = { horizontal: "center", vertical: "middle" }; });
      const total = dayHours.reduce((sum, hours) => sum + hours, 0);
      const cell = sheet.getCell(rowNumber, 15); cell.value = { formula: `SUM(H${rowNumber}:N${rowNumber})`, result: total }; cell.numFmt = "0.00"; cell.font = { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }; cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    for (let row = 7; row <= 25; row++) {
      applyBorder(sheet, `A${row}:R${row}`);
      for (let col = 16; col <= 18; col++) sheet.getCell(row, col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.grey } };
      if (row !== 7 && row !== 9) { const total = sheet.getCell(row, 15); total.value = { formula: `SUM(H${row}:N${row})`, result: 0 }; total.numFmt = "0.00"; }
    }
    merged(sheet, "A26:G26", "TOTALS", { font: { name: "Arial", bold: true, size: 11, color: { argb: COLORS.ink } }, alignment: { horizontal: "center", vertical: "middle" } });
    for (let col = 8; col <= 15; col++) { const letter = columnLetter(col); const cell = sheet.getCell(26, col); cell.value = { formula: `SUM(${letter}7:${letter}25)`, result: 0 }; cell.numFmt = "0.00"; cell.font = { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }; cell.alignment = { horizontal: "center", vertical: "middle" }; }
    applyBorder(sheet, "A26:R26");
    merged(sheet, "A27:G31", `MEMO:  MDS PO ${FIXED.purchaseOrder}`, { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { vertical: "top", wrapText: true } });
    merged(sheet, "H27:O31", "OVERTIME APPROVAL\n\nCONSTRUCTION\nMANAGER\n\nPROJECT\nMANAGER", { font: { name: "Arial", bold: true, size: 10, color: { argb: COLORS.ink } }, alignment: { vertical: "top", wrapText: true } });
    applyBorder(sheet, "A27:R31");
    for (let row = 27; row <= 31; row++) for (let col = 16; col <= 18; col++) sheet.getCell(row, col).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.grey } };
    [1, 2].forEach(row => sheet.getRow(row).height = 27); [3, 4].forEach(row => sheet.getRow(row).height = 22); [5, 6].forEach(row => sheet.getRow(row).height = 28); [27, 28, 29, 30, 31].forEach(row => sheet.getRow(row).height = 20);
    sheet.printArea = "A1:R31";
    sheet.headerFooter.oddFooter = `&L${FIXED.employee}&RWeek ending ${formatDate(end)} · Page &P of &N`;
  }

  function compareDatedRows(left, right, sortOrder) {
    const result = String(left && left.date || "").localeCompare(String(right && right.date || ""))
      || String(left && left.text || "").localeCompare(String(right && right.text || ""));
    return sortOrder === "date_desc" ? -result : result;
  }

  function createSummary(workbook, rows, expenses, period, sortOrder) {
    const firstDate = rows.map(row => isoDate(row.date)).find(Boolean) || expenses.map(row => isoDate(row.date)).find(Boolean) || isoDate(period) || new Date();
    const sheet = workbook.addWorksheet("Monthly Summary", { views: [{ state: "frozen", ySplit: 9, showGridLines: false }] });
    [14, 16, 16, 16, 44, 14, 14].forEach((width, index) => sheet.getColumn(index + 1).width = width);
    merged(sheet, "A1:G1", `MDS Billing Summary — ${formatMonth(firstDate)}`, { fill: COLORS.blue, font: { name: "Arial", bold: true, size: 18, color: { argb: COLORS.white } }, alignment: { vertical: "middle", horizontal: "left" } }); sheet.getRow(1).height = 28;
    [["Employee", FIXED.employee], ["Project", FIXED.project], ["MDS PO", FIXED.purchaseOrder]].forEach(([label, value], index) => { const row = 3 + index; sheet.getCell(row, 1).value = label; sheet.getCell(row, 1).font = { name: "Arial", bold: true, color: { argb: COLORS.ink } }; sheet.getCell(row, 2).value = value; applyBorder(sheet, `A${row}:B${row}`); });
    const regular = rows.filter(row => row.hourType === "regular").reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
    const overtime = rows.filter(row => row.hourType === "overtime").reduce((sum, row) => sum + (Number(row.hours) || 0), 0);
    const cadExpenses = expenses.filter(row => String(row.currency || "CAD").toUpperCase() !== "USD").reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const usdExpenses = expenses.filter(row => String(row.currency || "CAD").toUpperCase() === "USD").reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    [["Regular Hours", regular, "0.00"], ["Overtime Hours", overtime, "0.00"], ["Total Hours", regular + overtime, "0.00"], ["Expenses (CAD)", cadExpenses, "$#,##0.00"], ["Expenses (USD)", usdExpenses, "$#,##0.00"]].forEach(([label, value, numFmt], index) => { const row = 3 + index; merged(sheet, `D${row}:E${row}`, label, { fill: COLORS.paleBlue, font: { name: "Arial", bold: true, color: { argb: COLORS.blue } } }); const cell = sheet.getCell(row, 6); cell.value = value; cell.numFmt = numFmt; cell.font = { name: "Arial", bold: true, color: { argb: COLORS.blue } }; cell.alignment = { horizontal: "right", vertical: "middle" }; applyBorder(sheet, `D${row}:F${row}`); });
    ["Date", "Day", "Regular", "Overtime", "Source Secondary Record", "Start", "End"].forEach((value, index) => setHeaderCell(sheet.getCell(9, index + 1), value, COLORS.paleBlue)); applyBorder(sheet, "A9:G9");
    [...rows].sort((a, b) => compareDatedRows(a, b, sortOrder)).forEach((row, index) => {
      const target = 10 + index, date = isoDate(row.date);
      const values = [date || row.date, date ? new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", weekday: "long" }).format(date) : "", row.hourType === "regular" ? row.hours : null, row.hourType === "overtime" ? row.hours : null, row.text || "Untitled secondary record", row.start || "", row.end || ""];
      values.forEach((value, column) => { const cell = sheet.getCell(target, column + 1); cell.value = value; cell.alignment = { vertical: "top", wrapText: true }; if (column === 0 && date) cell.numFmt = "yyyy-mm-dd"; if (column === 2 || column === 3) cell.numFmt = "0.00"; }); applyBorder(sheet, `A${target}:G${target}`); sheet.getRow(target).height = 28;
    });
    sheet.autoFilter = { from: "A9", to: `G${Math.max(9, 9 + rows.length)}` };
  }

  function createExpensesSummary(workbook, expenses, period, sortOrder) {
    const firstDate = expenses.map(row => isoDate(row.date)).find(Boolean) || isoDate(period) || new Date();
    const sheet = workbook.addWorksheet("Expenses Summary", { views: [{ state: "frozen", ySplit: 7, showGridLines: false }] });
    [14, 18, 27, 52, 16, 12].forEach((width, index) => sheet.getColumn(index + 1).width = width);
    merged(sheet, "A1:F1", `MDS Expenses Summary — ${formatMonth(firstDate)}`, { fill: COLORS.blue, font: { name: "Arial", bold: true, size: 18, color: { argb: COLORS.white } }, alignment: { vertical: "middle", horizontal: "left" } }); sheet.getRow(1).height = 28;
    [["Employee", FIXED.employee], ["Project", FIXED.project], ["MDS PO", FIXED.purchaseOrder]].forEach(([label, value], index) => { const row = 3 + index; sheet.getCell(row, 1).value = label; sheet.getCell(row, 1).font = { name: "Arial", bold: true, color: { argb: COLORS.ink } }; sheet.getCell(row, 2).value = value; applyBorder(sheet, `A${row}:B${row}`); });
    ["Work Date", "Expense Type", "Primary Record", "Description", "Amount", "Currency"].forEach((value, index) => setHeaderCell(sheet.getCell(7, index + 1), value, COLORS.paleBlue)); applyBorder(sheet, "A7:F7");
    [...expenses].sort((a, b) => compareDatedRows(a, b, sortOrder)).forEach((row, index) => {
      const target = 8 + index, date = isoDate(row.date);
      const currency = String(row.currency || "CAD").toUpperCase() === "USD" ? "USD" : "CAD";
      const values = [date || row.date, row.expenseType || "Uncategorized", row.primary || "Untitled record", row.text || "Untitled secondary record", Number(row.amount) || 0, currency];
      values.forEach((value, column) => { const cell = sheet.getCell(target, column + 1); cell.value = value; cell.alignment = { vertical: "top", wrapText: true }; if (column === 0 && date) cell.numFmt = "yyyy-mm-dd"; if (column === 4) cell.numFmt = currency === "USD" ? "[$$-en-US]#,##0.00" : "[$$-en-CA]#,##0.00"; }); applyBorder(sheet, `A${target}:F${target}`); sheet.getRow(target).height = 30;
    });
    const totalRow = 8 + expenses.length;
    const cadTotal = expenses.filter(row => String(row.currency || "CAD").toUpperCase() !== "USD").reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    const usdTotal = expenses.filter(row => String(row.currency || "CAD").toUpperCase() === "USD").reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    merged(sheet, `A${totalRow}:D${totalRow}`, "TOTAL EXPENSES (CAD)", { fill: COLORS.paleBlue, font: { name: "Arial", bold: true, color: { argb: COLORS.blue } }, alignment: { horizontal: "right", vertical: "middle" } });
    const cadCell = sheet.getCell(totalRow, 5); cadCell.value = cadTotal; cadCell.numFmt = "[$$-en-CA]#,##0.00"; cadCell.font = { name: "Arial", bold: true, color: { argb: COLORS.blue } }; applyBorder(sheet, `A${totalRow}:F${totalRow}`);
    const usdRow = totalRow + 1;
    merged(sheet, `A${usdRow}:D${usdRow}`, "TOTAL EXPENSES (USD)", { fill: COLORS.paleBlue, font: { name: "Arial", bold: true, color: { argb: COLORS.blue } }, alignment: { horizontal: "right", vertical: "middle" } });
    const usdCell = sheet.getCell(usdRow, 5); usdCell.value = usdTotal; usdCell.numFmt = "[$$-en-US]#,##0.00"; usdCell.font = { name: "Arial", bold: true, color: { argb: COLORS.blue } }; applyBorder(sheet, `A${usdRow}:F${usdRow}`);
    sheet.autoFilter = { from: "A7", to: `F${Math.max(7, totalRow - 1)}` };
  }

  function buildWorkbook(payload) {
    const rows = (Array.isArray(payload && payload.rows) ? payload.rows : []).filter(row => isoDate(row.date) && (row.hourType === "regular" || row.hourType === "overtime") && Number(row.hours) > 0);
    const expenses = (Array.isArray(payload && payload.expenses) ? payload.expenses : []).filter(row => isoDate(row.date) && Number(row.amount) > 0);
    const sortOrder = payload && payload.sortOrder === "date_desc" ? "date_desc" : "date_asc";
    const workbook = new (excel().Workbook)();
    workbook.creator = "SiteScribe Review Console"; workbook.lastModifiedBy = "SiteScribe Review Console"; workbook.created = new Date(); workbook.modified = new Date(); workbook.calcProperties.fullCalcOnLoad = true;
    createSummary(workbook, rows, expenses, payload && payload.period, sortOrder);
    const weeks = new Map();
    rows.forEach(row => { const start = weekStart(isoDate(row.date)), key = isoText(start); if (!weeks.has(key)) weeks.set(key, { start, rows: [] }); weeks.get(key).rows.push(row); });
    [...weeks.values()].sort((a, b) => (a.start - b.start) * (sortOrder === "date_desc" ? -1 : 1)).forEach(week => createTimesheet(workbook, week.start, week.rows));
    createExpensesSummary(workbook, expenses, payload && payload.period, sortOrder);
    return workbook;
  }

  async function exportWorkbook(payload) {
    const workbook = buildWorkbook(payload);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = String(payload && payload.filename || "MDS_Billing.xlsx"); document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { timeRowCount: Array.isArray(payload && payload.rows) ? payload.rows.length : 0, expenseRowCount: Array.isArray(payload && payload.expenses) ? payload.expenses.length : 0, weekCount: Math.max(0, workbook.worksheets.length - 2) };
  }

  global.SiteScribeMdsExcel = { buildWorkbook, exportWorkbook, fixed: FIXED };
})(typeof window !== "undefined" ? window : globalThis);
