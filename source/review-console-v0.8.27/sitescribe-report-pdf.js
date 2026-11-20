/* SiteScribe report PDF adapter. pdfmake 0.3.12 + bundled Roboto fonts.
   Only text, tables and HTTP(S) link annotations are exported. No remote
   resource or linked Dropbox document is fetched by this adapter. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SiteScribeReportPdf = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const clean = text => String(text || "").replace(/[\u2010-\u2015\u2212]/g, "-").replace(/\u00a0/g, " ");
  function safeLink(value) {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? value : "";
    } catch (_) { return ""; }
  }
  function inline(node, inherited = {}) {
    if (node.nodeType === 3) return [{text: clean(node.textContent).replace(/\s+/g, " "), ...inherited}];
    if (node.nodeType !== 1 || node.matches("script, style, img, iframe, button, input")) return [];
    if (node.tagName === "BR") return [{text:"\n", ...inherited}];
    const style = {...inherited};
    if (node.matches("strong, b, .report-primary-title, .report-secondary-title.has-activities")) style.bold = true;
    if (node.matches("em, i, .report-activity-title")) style.italics = true;
    if (node.matches("a[href]")) {
      const link = safeLink(node.getAttribute("href"));
      if (link) Object.assign(style, {link, color:"#145b9b", decoration:"underline", wordBreak:"break-all"});
    }
    const runs = [...node.childNodes].flatMap(child => inline(child, style));
    if (node.classList.contains("report-label")) runs.push({text:": ", ...inherited});
    if (node.classList.contains("report-activity-title") && node.closest("td")) {
      runs.unshift({text:node.previousElementSibling ? "\n  " : "  "});
    }
    return runs;
  }
  function paragraph(node) {
    const text = inline(node);
    if (!text.some(run => String(run.text).trim())) return [];
    const result = {text, margin:[0,0,0,3]};
    if (/^H[1-4]$/.test(node.tagName)) {
      Object.assign(result, {fontSize:node.tagName === "H1" ? 22 : node.tagName === "H2" ? 15 : 12, bold:true, color:"#263b59", margin:[0,node.tagName === "H3" ? 10 : 2,0,6], headlineLevel:1});
    } else if (node.matches(".report-meta, .report-empty")) {
      Object.assign(result, {fontSize:8.5, color:"#58677a", margin:[0,0,0,2]});
    } else if (node.matches(".report-total-hours")) {
      Object.assign(result, {fontSize:13, bold:true, margin:[0,3,0,8]});
    } else if (node.matches(".report-primary-title, .report-secondary-title.has-activities")) result.headlineLevel = 1;
    return [result];
  }
  function table(node) {
    const rows = [...node.rows];
    if (!rows.length) return [];
    const columns = Math.max(...rows.map(row => row.cells.length));
    const widths = columns === 9 ? [40,65,"*","*","*",34,34,32,36]
      : columns === 7 ? [44,48,"*","*",38,38,35]
      : columns === 6 ? [44,72,"*","*",58,40] : Array(columns).fill("*");
    const body = rows.map(row => Array.from({length:columns}, (_, index) => {
      const cell = row.cells[index];
      return {text:cell ? inline(cell) : "", fontSize:8.5, margin:[0,2,0,2], ...(cell?.tagName === "TH" ? {bold:true,fillColor:"#eef4fb",color:"#263b59"} : {})};
    }));
    // Keep ordinary rows together, but allow genuinely long entries to span
    // pages instead of risking clipping an over-height unbreakable row.
    const shortRows = [6,7,9].includes(columns) && rows.every(row => [...row.cells].every(cell => cell.textContent.length <= 450));
    return [{table:{headerRows:node.tHead?.rows.length || (rows[0].querySelector("th") ? 1 : 0),widths,body,dontBreakRows:shortRows},layout:{hLineColor:()=>"#c8d4e2",vLineColor:()=>"#c8d4e2",hLineWidth:()=>0.5,vLineWidth:()=>0.5},margin:[0,6,0,10]}];
  }
  function blocks(node) {
    if (node.nodeType === 3) return node.textContent.trim() ? [{text:clean(node.textContent),margin:[0,0,0,3]}] : [];
    if (node.nodeType !== 1 || node.matches("script, style, img, iframe, button, input")) return [];
    if (node.tagName === "TABLE") return table(node);
    if (node.matches("ul, ol")) {
      const entries = [...node.children].filter(child => child.tagName === "LI").map(li => {
        const own = [...li.childNodes].filter(child => child.nodeType !== 1 || !child.matches("ul, ol"));
        const nested = [...li.children].filter(child => child.matches("ul, ol"));
        const textLength = own.reduce((sum,child)=>sum+child.textContent.length,0);
        return {stack:[{stack:own.flatMap(blocks),unbreakable:textLength <= 1600},...nested.flatMap(blocks)],margin:[0,2,0,5]};
      });
      return entries.length ? [{[node.tagName === "OL" ? "ol" : "ul"]:entries,margin:[14,3,0,6]}] : [];
    }
    if ([...node.children].some(child => child.matches("div, section, header, article, p, h1, h2, h3, h4, ul, ol, table"))) return [...node.childNodes].flatMap(blocks);
    return paragraph(node);
  }
  function buildDefinition(reportRoot, options = {}) {
    if (!reportRoot || !reportRoot.textContent.trim()) throw new Error("No report content to export.");
    const hasTable = !!reportRoot.querySelector("table");
    return {
      pageSize:"LETTER",pageOrientation:hasTable ? "landscape" : "portrait",pageMargins:[36,36,36,42],
      info:{title:options.title || "SiteScribe report",author:"SiteScribe",subject:"Selected SiteScribe report"},
      defaultStyle:{font:"Roboto",fontSize:10,lineHeight:1.2,color:"#1f2933"},
      content:[...reportRoot.childNodes].flatMap(blocks),
      footer:(page,total)=>({text:`SiteScribe  |  Page ${page} of ${total}`,alignment:"right",fontSize:8,color:"#697386",margin:[36,12,36,0]}),
      pageBreakBefore:(node,container)=>!!node.headlineLevel && container.getFollowingNodesOnPage().length === 0
    };
  }
  async function createBlob(reportRoot, options = {}, engine) {
    const renderer = engine || (typeof window !== "undefined" ? window.pdfMake : null);
    if (!renderer?.createPdf) throw new Error("PDF renderer is unavailable. Refresh SiteScribe and try again.");
    const definition = buildDefinition(reportRoot, options);
    return renderer.createPdf(definition).getBlob();
  }
  return {buildDefinition,createBlob,safeLink};
});
