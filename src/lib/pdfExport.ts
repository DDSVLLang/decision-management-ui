import jsPDF from 'jspdf'
import type { ReportDecision } from '../stores/reports'

// ─── Public API types ─────────────────────────────────────────────────────────

interface PDFExportOptions {
    year: string
    decisions: ReportDecision[]
    title: string
    /** Base64-encoded PNG of the watermark logo (optional). */
    watermarkPng?: string
}

// ─── Layout Constants (Landscape A4: 297 × 210 mm) ───────────────────────────

const MARGIN      = 12
const FONT_SIZE   = 9
const LINE_H      = 4.5   // line height for normal/bold text (mm)
const SECTION_GAP = 2
const BLOCK_GAP   = 5
const THEMA_GAP   = 1
const FOOTER_H    = 9

// ─── Column positions (Thema removed — now a full-width line) ─────────────────
// 5 columns spread across the full content width (273 mm usable)

const COL = {
    date:       MARGIN,            // 12
    gremium:    MARGIN + 50,       // 62
    drucksache: MARGIN + 100,      // 112
    dept:       MARGIN + 158,      // 170
    completion: MARGIN + 218,      // 230
} as const

const COL_W = {
    date:       38,
    gremium:    38,
    drucksache: 50,
    dept:       50,
    completion: 45,
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

// ─── Watermark ────────────────────────────────────────────────────────────────

function drawWatermark(doc: jsPDF, watermarkPng: string): void {
    const wmWidth  = 100
    const wmHeight = 100
    const cx = (pageWidth(doc)  - wmWidth)  / 2
    const cy = (pageHeight(doc) - wmHeight) / 2

    const gState = new (doc as any).GState({ opacity: 0.06 })
    doc.saveGraphicsState()
    doc.setGState(gState)
    doc.addImage(watermarkPng, 'SVG', cx, cy, wmWidth, wmHeight)
    doc.restoreGraphicsState()
}

// ─── Column header (redrawn on every new page) ────────────────────────────────

const COL_HEADER_H = 16

function drawColumnHeader(doc: jsPDF, y: number): number {
    const cw = contentWidth(doc)

    // Grey background — covers ALL header rows
    doc.setFillColor(235, 235, 235)
    doc.rect(MARGIN, y - 2, cw, COL_HEADER_H + 2, 'F')

    doc.setFontSize(FONT_SIZE)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)

    // Row 1: "Thema" label (full width)
    doc.text('Thema', MARGIN, y + 1)
    y += LINE_H + 2

    // Row 2: column labels — right-aligned to match data columns
    doc.text('Beschlussdatum',     COL.date,                            y)
    doc.text('Gremium',            COL.gremium    + COL_W.gremium,      y, { align: 'right' })
    doc.text('Drucksache',         COL.drucksache + COL_W.drucksache,   y, { align: 'right' })
    doc.text('zust. OE',           COL.dept       + COL_W.dept,         y, { align: 'right' })
    doc.text('vor. erledigt bis', COL.completion  + COL_W.completion,   y, { align: 'right' })
    y += LINE_H + 1

    // Row 3: sub-label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(FONT_SIZE - 1)
    doc.text('Betreff / Stand der Erledigung', MARGIN, y)
    y += LINE_H

    // Bottom border
    doc.setLineWidth(0.5)
    doc.setTextColor(0, 0, 0)
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

/**
 * Writes pre-split lines RIGHT-ALIGNED at (x + maxWidth).
 * Used for Gremium, Drucksache, zust. OE, vor. erledigt bis columns.
 */
function writeWrappedRight(
    doc: jsPDF, lines: string[], x: number, y: number,
    maxWidth: number, lineHeight: number, onNewPage: () => number,
): number {
    const rightX = x + maxWidth
    for (const line of lines) {
        if (y > maxY(doc)) y = onNewPage()
        doc.text(line, rightX, y, { align: 'right' })
        y += lineHeight
    }
    return y
}

// ─── Domain helpers ───────────────────────────────────────────────────────────

function getReportContent(decision: ReportDecision, year: string): string {
    if (!decision.reports?.length) return 'Keine Angaben'
    return decision.reports.find((r) => r.year === year)?.content ?? 'Keine Angaben'
}

function getExpectedCompletion(decision: ReportDecision, year: string): string {
    if (!decision.reports?.length) return ''
    return decision.reports.find((r) => r.year === year)?.expectedCompletionQuarter ?? ''
}

// ─── Date formatting helper ───────────────────────────────────────────────────

function formatDate(dateStr: string | undefined | null): string {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('de-DE', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
    })
}

// ─── Block height estimator ──────────────────────────────────────────────────

function estimateBlockHeight(doc: jsPDF, decision: ReportDecision, year: string): number {
    const cw = contentWidth(doc)

    const themaLines = (doc.splitTextToSize(decision.topic ?? '', cw) as string[]).length

    const gremiumLines    = (doc.splitTextToSize(decision.decisionBody ?? '', COL_W.gremium)    as string[]).length
    const drucksacheLines = (doc.splitTextToSize(decision.printMatter  ?? '', COL_W.drucksache)  as string[]).length
    const deptText        = decision.responsibleDepartment
        ?? decision.departments?.map((d) => d.name).join(', ') ?? ''
    const deptLines       = (doc.splitTextToSize(deptText, COL_W.dept) as string[]).length
    const dataRowH        = Math.max(gremiumLines, drucksacheLines, deptLines, 1) * LINE_H

    const titleLines     = (doc.splitTextToSize(decision.title ?? '', cw) as string[]).length
    const sachstand      = getReportContent(decision, year)
    const sachstandLines = (doc.splitTextToSize(sachstand, cw) as string[]).length

    return (
        themaLines * LINE_H + THEMA_GAP     // Thema + tight gap
        + dataRowH + SECTION_GAP            // Data row
        + titleLines * LINE_H + SECTION_GAP // Betreff
        + LINE_H                            // "Sachstand:" label
        + sachstandLines * LINE_H           // Sachstand content
        + 2                                 // safety margin
    )
}

// ─── Build PDF document ──────────────────────────────────────────────────────

function buildPDFDoc(options: PDFExportOptions): jsPDF {
    const { year, decisions, watermarkPng } = options

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    const fullTitle = `Bericht zum Ende Jahr ${year} über die noch nicht abschließend erledigten Beschlüsse der Gremien`

    // ── Page header factory ───────────────────────────────────────────────
    function drawPageHeader(): number {
        if (watermarkPng) drawWatermark(doc, watermarkPng)
        return drawColumnHeader(doc, MARGIN + LINE_H)
    }

    function onNewPage(): number {
        doc.addPage()
        return drawPageHeader()
    }

    // ── Page 1: watermark + global title ──────────────────────────────────
    if (watermarkPng) drawWatermark(doc, watermarkPng)

    let y = MARGIN + 2
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    y = writeWrapped(doc, fullTitle, MARGIN, y, contentWidth(doc), 6.5, onNewPage)
    y += 5

    y = drawColumnHeader(doc, y)

    // ── Decision blocks ───────────────────────────────────────────────────
    decisions.forEach((decision) => {
        doc.setFontSize(FONT_SIZE)

        const decisionDate   = formatDate(decision.decisionDate)
        const topicText      = decision.topic ?? ''
        const gremiumText    = decision.decisionBody ?? ''
        const drucksacheText = decision.printMatter ?? ''
        const deptText       = decision.responsibleDepartment
            ?? decision.departments?.map((d) => d.name).join(', ')
            ?? ''
        const completion     = getExpectedCompletion(decision, year)
        const titleText      = decision.title ?? ''
        const sachstand      = getReportContent(decision, year)

        // ── Keep entire block on one page ─────────────────────────────────
        const blockH = BLOCK_GAP + estimateBlockHeight(doc, decision, year)
        if (y + blockH > maxY(doc)) {
            y = onNewPage()
        }

        // ── Block spacing ─────────────────────────────────────────────────
        y += BLOCK_GAP

        // ── Thema (full-width bold line) ──────────────────────────────────
        doc.setFont('helvetica', 'bold')
        y = writeWrapped(doc, topicText, MARGIN, y, contentWidth(doc), LINE_H, onNewPage)
        y += THEMA_GAP

        // ── Data row (5 columns) — right-aligned except date ──────────────
        doc.setFont('helvetica', 'normal')
        const gremiumLines    = doc.splitTextToSize(gremiumText,    COL_W.gremium)    as string[]
        const drucksacheLines = doc.splitTextToSize(drucksacheText, COL_W.drucksache) as string[]
        const deptLines       = doc.splitTextToSize(deptText,       COL_W.dept)       as string[]

        const dataRowLines = Math.max(
            gremiumLines.length,
            drucksacheLines.length,
            deptLines.length,
            1,
        )
        const dataRowH = dataRowLines * LINE_H

        // Date stays left-aligned
        doc.text(decisionDate, COL.date, y)

        // Right-aligned columns
        const dataRowY = y
        writeWrappedRight(doc, gremiumLines,    COL.gremium,    dataRowY, COL_W.gremium,    LINE_H, onNewPage)
        writeWrappedRight(doc, drucksacheLines, COL.drucksache, dataRowY, COL_W.drucksache, LINE_H, onNewPage)
        writeWrappedRight(doc, deptLines,       COL.dept,       dataRowY, COL_W.dept,       LINE_H, onNewPage)
        if (completion) {
            doc.text(completion, COL.completion + COL_W.completion, dataRowY, { align: 'right' })
        }

        y += dataRowH + SECTION_GAP

        // ── Betreff ───────────────────────────────────────────────────────
        doc.setFont('helvetica', 'normal')
        y = writeWrapped(doc, titleText, MARGIN, y, contentWidth(doc), LINE_H, onNewPage)
        y += SECTION_GAP

        // ── Sachstand ─────────────────────────────────────────────────────
        doc.setFont('helvetica', 'bold')
        y = writeLine(doc, 'Sachstand:', MARGIN, y, LINE_H, onNewPage)

        doc.setFont('helvetica', 'normal')
        y = writeWrapped(doc, sachstand, MARGIN, y, contentWidth(doc), LINE_H, onNewPage)
    })

    return doc
}

// ─── SVG → PNG conversion helper ─────────────────────────────────────────────

export function svgToPng(svgSource: string, width = 400, height = 400): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width  = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) { reject(new Error('Canvas 2D context unavailable')); return }
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => reject(new Error('Failed to load SVG for watermark conversion'))

        if (svgSource.trim().startsWith('<')) {
            const blob = new Blob([svgSource], { type: 'image/svg+xml;charset=utf-8' })
            img.src = URL.createObjectURL(blob)
        } else {
            img.src = svgSource
        }
    })
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function exportReportToPDF(options: PDFExportOptions): void {
    const { year } = options
    const doc = buildPDFDoc(options)

    const reportTitle = `Bericht ${year} – nicht erledigte Beschlüsse der Gremien`

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
    const url  = URL.createObjectURL(blob)
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