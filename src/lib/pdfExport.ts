import jsPDF from 'jspdf'
import type { ReportDecision } from '../stores/reports'

interface PDFExportOptions {
    year: string
    decisions: ReportDecision[]
    title: string
}

// ─── Layout Constants (Landscape A4: 297 x 210 mm) ───────────────────────────

const MARGIN      = 12
const FONT_SIZE   = 9
const LINE_H      = 4.5   // line height for normal/bold text (mm)
const SECTION_GAP = 3     // vertical gap between Thema-row → Betreff → Sachstand
const BLOCK_GAP   = 6     // half-gap above AND below the separator line
const FOOTER_H    = 9     // reserved height at page bottom for footer

const COL = {
    topic:      MARGIN,        // 12
    date:       MARGIN + 60,   // 54
    gremium:    MARGIN + 95,   // 78
    drucksache: MARGIN + 130,   // 100
    dept:       MARGIN + 165,  // 132
    completion: MARGIN + 200,  // 164
} as const

const COL_W = {
    topic:      40,   // must be < (COL.date - COL.topic - 2)
    date:       22,
    gremium:    20,
    drucksache: 28,
    dept:       30,
    completion: 22,
} as const

// ─── Page helpers ─────────────────────────────────────────────────────────────

function pageWidth(doc: jsPDF): number  { return doc.internal.pageSize.getWidth()  }
function pageHeight(doc: jsPDF): number { return doc.internal.pageSize.getHeight() }
function contentWidth(doc: jsPDF): number { return pageWidth(doc) - 2 * MARGIN }

/** Lowest Y before we hit the footer zone. */
function maxY(doc: jsPDF): number {
    return pageHeight(doc) - MARGIN - FOOTER_H
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function drawFooter(doc: jsPDF, pageNum: number, totalPages: number, reportTitle: string): void {
    const fy = pageHeight(doc) - MARGIN / 2
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.setLineWidth(0.2)
    doc.setDrawColor(160, 160, 160)
    doc.line(MARGIN, fy - 3.5, pageWidth(doc) - MARGIN, fy - 3.5)
    doc.text(reportTitle, MARGIN, fy)
    const label = `Seite ${pageNum} von ${totalPages}`
    doc.text(label, pageWidth(doc) - MARGIN - doc.getTextWidth(label), fy)
    doc.setDrawColor(0, 0, 0)
    doc.setTextColor(0, 0, 0)
}

// ─── Column header (redrawn on every new page) ────────────────────────────────

const COL_HEADER_H = 13  // total height consumed by the header block

function drawColumnHeader(doc: jsPDF, y: number): number {
    // Grey background strip
    doc.setFillColor(235, 235, 235)
    doc.rect(MARGIN, y - 1, contentWidth(doc), COL_HEADER_H - 4, 'F')

    // Row 1: column labels
    doc.setFontSize(FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text('Thema',              COL.topic,      y)
    doc.text('Beschlussdatum',     COL.date,       y)
    doc.text('Gremium',            COL.gremium,    y)
    doc.text('Drucksache',         COL.drucksache, y)
    doc.text('zust. OE',           COL.dept,       y)
    doc.text('vor. erledigt bis:', COL.completion, y)
    doc.setTextColor(0, 0, 0)
    y += LINE_H + 1

    // Row 2: sub-labels
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(FONT_SIZE - 1)
    doc.text('Betreff / Stand der Erledigung', COL.topic, y)
    y += LINE_H

    // Bottom border
    doc.setLineWidth(0.5)
    doc.line(MARGIN, y, pageWidth(doc) - MARGIN, y)
    doc.setFontSize(FONT_SIZE)
    return y + 2
}

// ─── Text helpers ─────────────────────────────────────────────────────────────

function writeLine(
    doc: jsPDF, text: string, x: number, y: number,
    lineHeight: number, onNewPage: () => number,
): number {
    if (y > maxY(doc)) y = onNewPage()
    doc.text(text, x, y)
    return y + lineHeight
}

function writeWrapped(
    doc: jsPDF, text: string, x: number, y: number,
    maxWidth: number, lineHeight: number, onNewPage: () => number,
): number {
    for (const line of doc.splitTextToSize(text || '', maxWidth) as string[]) {
        if (y > maxY(doc)) y = onNewPage()
        doc.text(line, x, y)
        y += lineHeight
    }
    return y
}

// ─── Domain helpers ───────────────────────────────────────────────────────────

function getReportContent(decision: ReportDecision, year: string): string {
    if (!decision.reports?.length) return 'Keine Angaben'
    return decision.reports.find((r) => r.year === year)?.content
        ?? decision.reports.find((r) => r.year === year)?.content ?? 'Keine Angaben'
}

function getExpectedCompletion(decision: ReportDecision, year: string): string {
    if (!decision.reports?.length) return ''
    return decision.reports.find((r) => r.year === year)?.expectedCompletionQuarter ?? ''
}

// ─── Block height estimator ───────────────────────────────────────────────────
/**
 * Estimates the total rendered height of a single decision block (mm).
 * Used ONLY for the "keep block together" page-break check.
 * Does NOT need to be pixel-perfect — a generous estimate is intentional.
 */
function estimateBlockHeight(doc: jsPDF, decision: ReportDecision, year: string): number {
    const cw = contentWidth(doc)

    const topicLines      = (doc.splitTextToSize(decision.topic      ?? '', COL_W.topic)      as string[]).length
    const gremiumLines    = (doc.splitTextToSize(decision.decisionBody ?? '', COL_W.gremium)   as string[]).length
    const drucksacheLines = (doc.splitTextToSize(decision.printMatter  ?? '', COL_W.drucksache) as string[]).length
    const deptText        = decision.responsibleDepartment
        ?? decision.departments?.map((d) => d.name).join(', ') ?? ''
    const deptLines       = (doc.splitTextToSize(deptText, COL_W.dept) as string[]).length

    const dataRowH = Math.max(topicLines, gremiumLines, drucksacheLines, deptLines, 1) * LINE_H

    const titleLines    = (doc.splitTextToSize(decision.title ?? '', cw) as string[]).length
    const sachstand     = getReportContent(decision, year)
    const sachstandLines = (doc.splitTextToSize(sachstand, cw) as string[]).length

    return (
        dataRowH
        + SECTION_GAP
        + titleLines    * LINE_H + SECTION_GAP
        + LINE_H                              // "Sachstand:" label
        + sachstandLines * LINE_H
    )
}

function buildPDFDoc(options: PDFExportOptions): jsPDF {
    const { year, decisions } = options

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    const fullTitle   = `Bericht zum Ende Jahr ${year} über die noch nicht abschließend erledigten Beschlüsse der Gremien`

    // ── Page header factory ───────────────────────────────────────────────────
    function drawPageHeader(): number {
        return drawColumnHeader(doc, MARGIN + LINE_H)
    }

    function onNewPage(): number {
        doc.addPage()
        return drawPageHeader()
    }

    // ── Page 1: global title ──────────────────────────────────────────────────
    let y = MARGIN + 2
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    y = writeWrapped(doc, fullTitle, MARGIN, y, contentWidth(doc), 6.5, onNewPage)
    y += 5

    y = drawColumnHeader(doc, y)

    // ── Decision blocks ───────────────────────────────────────────────────────
    for (const decision of decisions) {
        doc.setFontSize(FONT_SIZE)

        const decisionDate   = decision.decisionDate
            ? new Date(decision.decisionDate).toLocaleDateString('de-DE')
            : ''
        const topicText      = decision.topic ?? ''
        const gremiumText    = decision.decisionBody ?? ''
        const drucksacheText = decision.printMatter ?? ''
        const deptText       = decision.responsibleDepartment
            ?? decision.departments?.map((d) => d.name).join(', ')
            ?? ''
        const completion     = getExpectedCompletion(decision, year)
        const titleText      = decision.title ?? ''
        const sachstand      = getReportContent(decision, year)

        // ── FIX 3: Keep entire block on one page ──────────────────────────────
        // BLOCK_GAP/2 above separator + separator + BLOCK_GAP/2 below + content
        const blockH = BLOCK_GAP + estimateBlockHeight(doc, decision, year)
        if (y + blockH > maxY(doc)) {
            y = onNewPage()
        }

        // ── FIX 2: Separator centered between blocks ──────────────────────────
        // Equal gap (BLOCK_GAP/2) ABOVE and BELOW the line
        y += BLOCK_GAP / 2
        doc.setLineWidth(0.15)
        doc.setDrawColor(200, 200, 200)
        doc.line(MARGIN, y, pageWidth(doc) - MARGIN, y)
        doc.setDrawColor(0, 0, 0)
        y += BLOCK_GAP / 2

        // ── FIX 1: Data row — pre-split with corrected column widths ─────────
        doc.setFont('helvetica', 'bold')
        const topicLines      = doc.splitTextToSize(topicText,      COL_W.topic)      as string[]
        const gremiumLines    = doc.splitTextToSize(gremiumText,    COL_W.gremium)    as string[]
        const drucksacheLines = doc.splitTextToSize(drucksacheText, COL_W.drucksache) as string[]
        const deptLines       = doc.splitTextToSize(deptText,       COL_W.dept)       as string[]

        const dataRowLines = Math.max(
            topicLines.length, gremiumLines.length,
            drucksacheLines.length, deptLines.length, 1,
        )
        const dataRowH = dataRowLines * LINE_H

        doc.text(topicLines,      COL.topic,      y)
        doc.text(decisionDate,    COL.date,       y)
        doc.text(gremiumLines,    COL.gremium,    y)
        doc.text(drucksacheLines, COL.drucksache, y)
        doc.text(deptLines,       COL.dept,       y)
        if (completion) doc.text(completion, COL.completion, y)

        y += dataRowH + SECTION_GAP

        // ── Betreff ───────────────────────────────────────────────────────────
        doc.setFont('helvetica', 'normal')
        y = writeWrapped(doc, titleText, MARGIN, y, contentWidth(doc), LINE_H, onNewPage)
        y += SECTION_GAP

        // ── Sachstand ─────────────────────────────────────────────────────────
        doc.setFont('helvetica', 'bold')
        y = writeLine(doc, 'Sachstand:', MARGIN, y, LINE_H, onNewPage)

        doc.setFont('helvetica', 'normal')
        y = writeWrapped(doc, sachstand, MARGIN, y, contentWidth(doc), LINE_H, onNewPage)
    }

    return doc
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function exportReportToPDF(options: PDFExportOptions): void {

    const { year } = options
    const doc = buildPDFDoc(options)

    const reportTitle = `Bericht ${year} – nicht erledigte Beschlüsse der Gremien`

    // ── Footers: rendered last when totalPages is known ───────────────────────
    const totalPages: number = (doc.internal as any).pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        drawFooter(doc, i, totalPages, reportTitle)
    }

    const fileName = `${year.replace('/', '-')}-bericht.pdf`
    doc.save(fileName)
}

export function printReportPDF(options: PDFExportOptions): void {
    const doc = buildPDFDoc(options)
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
        printWindow.addEventListener('load', () => {
            printWindow.focus()
            printWindow.print()
            printWindow.addEventListener('afterprint', () => {
                URL.revokeObjectURL(url)
            })
        })
    }
}
