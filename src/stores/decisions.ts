import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface Decision {
  id: number
  title: string
  decisionBody: string
  decisionDate: string
  printMatter: string
  responsibleDepartment: string
  responsibleDepartments: string[]
  topic: string
  status: 'pending' | 'in-progress' | 'completed'
  content: string
  dueDate?: string
  implementationNotes?: string
  reports?: Report[]
  deleted?: boolean
  createdBy?: string
  completedAt?: string
  completedBy?: string
  completedByUser?: { firstName: string; lastName: string }
}

export interface Report {
  id: string
  year: string
  content: string
  expectedCompletionQuarter?: string
  createdAt: string
  createdBy?: string
  createdByUser?: { firstName: string; lastName: string }
}

export const useDecisionStore = defineStore('decisions', () => {
  const decisions = ref<Decision[]>([
    {
      id: 446,
      title: 'Bau eines Raddirektwege zwischen Frankfurt und Darmstadt',
      decisionBody: 'STVV',
      decisionDate: '2017-12-07',
      printMatter: '265-1/XVIII/17',
      responsibleDepartment: 'FD 13',
      responsibleDepartments: ['FD 13', 'FD 20'],
      topic: 'Radverkehrskonzept',
      status: 'in-progress',
      content: `a) Die Stadt Langen stimmt dem Routenverlauf in ihrer Gemarkung / ihrem Stadtgebiet für die Umsetzung des Fahrraddirektwege zu.

aa) Die Stadt Langen verfolgt in enger Abstimmung mit der Regionalpark Südwest GmbH zusätzlich zur sog. Ostvariante weitere Trassenführungen auf der Westseite der Bahnlinie, die als sog. Zuführungen geplant werden. Als Grundlage dienen u.a. die Vorschläge aus dem Antrag der CDU vom 19.10.2017.

b) Die Stadt Langen nimmt die allgemeinen Informationen zum Raddirektwege zur Kenntnis.

c) Es wird zur Kenntnis genommen, dass die Antragstellung an Hessen Mobil über die Regionalpark Südwest GmbH erfolgt. Diese erhält auch die Bewilligungsbescheide und ist mit ihren Rechten und Pflichten als Antragsteller Hessen Mobil gegenüber verantwortlich.

d) Die Stadt Langen erklärt sich bereit, nach detaillierter Antragsstellung pro Kommune für die Umsetzung des Fahrraddirektwege den Eigenanteil mitzufinanzieren und deren Unterhaltung zu übernehmen sowie die Kostenanteile im Haushalt einzuplanen.

E) Der vorläufige Zeitplan für die Umsetzung wird zur Kenntnis genommen.`,
      dueDate: '2024-12-31',
      implementationNotes: 'Planung läuft nach Zeitplan. Abstimmung mit Regionalpark Südwest GmbH erfolgt regelmäßig.',
      reports: [
        {
          id: '1',
          year: '2022/2023',
          content: 'Zwischenzeitlich liegen die Ergebnisse einer Machbarkeitsstudie mit Variantenbetrachtungen vor. Im ÜBV vom 26.04.23 wurden erste Ergebnisse vorgestellt.',
          expectedCompletionQuarter: '2024/Q4',
          createdAt: '2022-12-15',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        },
        {
          id: '2',
          year: '2021/2022',
          content: 'Das Gutachten zur perspektivischen Beurteilung der Gesamtsituation wird derzeit durch ein Fachbüro erarbeitet. Aufgrund der Auslastung der Fachbüros verzögert sich die Fertigstellung.',
          expectedCompletionQuarter: '2022/Q3',
          createdAt: '2021-12-10',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        },
        {
          id: '3',
          year: '2020/2021',
          content: 'Ein Angebot für ein hydrologisch-ökologisches Gutachten liegt vor. Aufgrund der baulichen Situation der Einfassung des Teiches, wird derzeit eine Kostenermittlung erstellt.',
          expectedCompletionQuarter: undefined,
          createdAt: '2021-06-30',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 696,
      title: 'Straßenbahnverlängerung Frankfurt - Neu-Isenburg - Dreieich nach Langen',
      decisionBody: 'STVV',
      decisionDate: '2023-09-28',
      printMatter: '375-1/XIX/23',
      responsibleDepartment: 'FD 13',
      responsibleDepartments: ['FD 13'],
      topic: 'Straßenbahn',
      status: 'in-progress',
      content: 'Der Fortführung der Machbarkeitsstudie wird zugestimmt. Die vorgeschlagene Variante , L 5 Klinikum - Nördliche Ringstraße - Bahnhof Langen" soll als Grundlage für die weiteren Untersuchungen genommen werden.',
      dueDate: '2024-06-30',
      implementationNotes: 'Machbarkeitsstudie in Bearbeitung',
      reports: [
        {
          id: '4',
          year: '2023/2024',
          content: 'Mit Beschluss vom 07.12.2023 wurde die Variante 2 zur Umsetzung festgelegt. Leistungsverzeichnis und Vergabe der Nassentschlämung wurde vorbereitet und durchgeführt. Mit der Entschlämung soll im September 2024 begonnen werden. Die Umgestaltung ist für 2025 geplant.',
          expectedCompletionQuarter: '2025/Q4',
          createdAt: '2024-06-30',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 801,
      title: 'Modernisierung der IT-Infrastruktur',
      decisionBody: 'Haupt- und Finanzausschuss',
      decisionDate: '2023-03-15',
      printMatter: '102-3/XIX/23',
      responsibleDepartment: 'FD 10',
      responsibleDepartments: ['FD 10'],
      topic: 'Verwaltung',
      status: 'in-progress',
      content: 'Die Verwaltung wird beauftragt, die IT-Infrastruktur zu modernisieren und auf eine Cloud-basierte Lösung umzustellen. Die Kosten von 150.000 EUR werden aus dem Digitalisierungsfonds bereitgestellt.',
      dueDate: '2024-12-31',
      reports: [
        {
          id: '5',
          year: '2023/2024',
          content: 'Die Ausschreibung wurde durchgeführt. Drei qualifizierte Angebote liegen vor. Die Auswertung erfolgt im Q3/2024.',
          expectedCompletionQuarter: '2024/Q4',
          createdAt: '2024-05-20',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 802,
      title: 'Sanierung der Stadtbücherei',
      decisionBody: 'Bauausschuss',
      decisionDate: '2023-06-20',
      printMatter: '145-2/XIX/23',
      responsibleDepartment: 'FD 20',
      responsibleDepartments: ['FD 20', 'FD 30'],
      topic: 'Stadtentwicklung',
      status: 'in-progress',
      content: 'Die Stadtbücherei soll umfassend saniert werden. Dies umfasst die Erneuerung der Elektrik, Installation einer Klimaanlage und die Neugestaltung der Räumlichkeiten. Budget: 450.000 EUR.',
      dueDate: '2025-06-30',
      reports: [
        {
          id: '6',
          year: '2023/2024',
          content: 'Planungsphase abgeschlossen. Baugenehmigung liegt vor. Ausschreibung der Gewerke in Vorbereitung.',
          expectedCompletionQuarter: '2025/Q2',
          createdAt: '2024-03-15',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 803,
      title: 'Neubau Kindertagesstätte Nordend',
      decisionBody: 'STVV',
      decisionDate: '2023-11-10',
      printMatter: '198-5/XIX/23',
      responsibleDepartment: 'FD 30',
      responsibleDepartments: ['FD 30'],
      topic: 'Bildung',
      status: 'in-progress',
      content: 'Im Stadtteil Nordend soll eine neue viergruppige Kindertagesstätte errichtet werden. Die Einrichtung soll Platz für 100 Kinder bieten und nach KfW-55-Standard gebaut werden.',
      dueDate: '2026-08-01',
      reports: [
        {
          id: '7',
          year: '2023/2024',
          content: 'Grundstück wurde erworben. Architektenwettbewerb läuft. Erste Entwürfe werden im Q4/2024 erwartet.',
          expectedCompletionQuarter: '2026/Q3',
          createdAt: '2024-04-10',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 804,
      title: 'Förderung lokaler Sportvereine',
      decisionBody: 'Sozialausschuss',
      decisionDate: '2024-01-25',
      printMatter: '215-1/XIX/24',
      responsibleDepartment: 'FD 40',
      responsibleDepartments: ['FD 40'],
      topic: 'Soziales',
      status: 'pending',
      content: 'Die jährlichen Zuschüsse für lokale Sportvereine werden um 15% erhöht. Dies betrifft insgesamt 23 Vereine im Stadtgebiet. Zusätzliche Mittel: 75.000 EUR jährlich.',
      dueDate: '2024-07-01',
      reports: []
    },
    {
      id: 805,
      title: 'Klimaschutzkonzept 2025-2030',
      decisionBody: 'Umwelt- und Klimaschutzausschuss',
      decisionDate: '2024-02-14',
      printMatter: '228-4/XIX/24',
      responsibleDepartment: 'FD 50',
      responsibleDepartments: ['FD 50'],
      topic: 'Umwelt',
      status: 'in-progress',
      content: 'Ein umfassendes Klimaschutzkonzept für die Jahre 2025-2030 soll erstellt werden. Schwerpunkte: CO2-Reduktion, erneuerbare Energien, nachhaltige Mobilität. Förderung durch Bundesmittel wird beantragt.',
      dueDate: '2024-10-31',
      reports: [
        {
          id: '8',
          year: '2024/2025',
          content: 'Beauftragung eines Fachbüros erfolgt. Erste Bestandsaufnahme wurde durchgeführt. Bürgerbeteiligung ist für Juni 2024 geplant.',
          expectedCompletionQuarter: '2024/Q4',
          createdAt: '2024-04-20',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 806,
      title: 'Ausbau der Ganztagsbetreuung an Grundschulen',
      decisionBody: 'STVV',
      decisionDate: '2024-03-07',
      printMatter: '242-2/XIX/24',
      responsibleDepartment: 'FD 30',
      responsibleDepartments: ['FD 30', 'FD 40'],
      topic: 'Bildung',
      status: 'pending',
      content: 'Alle Grundschulen im Stadtgebiet sollen bis 2026 Ganztagsbetreuung anbieten. Dafür werden zusätzliche Räume geschaffen und Personal eingestellt. Gesamtkosten: 1,2 Mio. EUR.',
      dueDate: '2026-09-01',
      reports: []
    },
    {
      id: 807,
      title: 'Digitalisierung der Bürgerdienste',
      decisionBody: 'Haupt- und Finanzausschuss',
      decisionDate: '2024-04-18',
      printMatter: '259-1/XIX/24',
      responsibleDepartment: 'FD 10',
      responsibleDepartments: ['FD 10'],
      topic: 'Verwaltung',
      status: 'in-progress',
      content: 'Ein Online-Portal soll eingerichtet werden, über das Bürger Dokumente beantragen, Termine buchen und Anliegen einreichen können. Integration mit dem Bürgeramt-System.',
      dueDate: '2024-11-30',
      reports: [
        {
          id: '9',
          year: '2024/2025',
          content: 'Anforderungsanalyse abgeschlossen. Anbieterauswahl läuft. Pilotbetrieb ist für Oktober 2024 vorgesehen.',
          expectedCompletionQuarter: '2024/Q4',
          createdAt: '2024-06-15',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 808,
      title: 'Renaturierung des Langener Bachs',
      decisionBody: 'Umwelt- und Klimaschutzausschuss',
      decisionDate: '2024-05-22',
      printMatter: '278-3/XIX/24',
      responsibleDepartment: 'FD 50',
      responsibleDepartments: ['FD 50'],
      topic: 'Umwelt',
      status: 'pending',
      content: 'Der Langener Bach soll auf einer Länge von 2,5 km renaturiert werden. Maßnahmen umfassen die Entfernung von Uferbefestigungen, Anlage von Flachwasserzonen und Bepflanzung mit heimischen Arten.',
      dueDate: '2025-09-30',
      reports: []
    },
    {
      id: 809,
      title: 'Modernisierung der Straßenbeleuchtung',
      decisionBody: 'Bauausschuss',
      decisionDate: '2024-06-13',
      printMatter: '291-5/XIX/24',
      responsibleDepartment: 'FD 60',
      responsibleDepartments: ['FD 60'],
      topic: 'Stadtentwicklung',
      status: 'in-progress',
      content: 'Die gesamte Straßenbeleuchtung im Stadtgebiet soll auf energiesparende LED-Technologie umgestellt werden. Dies betrifft ca. 3.200 Leuchten. Erwartete Energieeinsparung: 60%.',
      dueDate: '2025-12-31',
      reports: [
        {
          id: '10',
          year: '2024/2025',
          content: 'Bestandsaufnahme durchgeführt. Förderantrag beim Land Hessen gestellt. Erste Testinstallationen in der Bahnhofstraße erfolgreich.',
          expectedCompletionQuarter: '2025/Q4',
          createdAt: '2024-08-05',
          createdBy: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
          createdByUser: { firstName: 'Normal', lastName: 'User' }
        }
      ]
    },
    {
      id: 810,
      title: 'Sanierung des Hallenbads',
      decisionBody: 'STVV',
      decisionDate: '2024-07-11',
      printMatter: '305-2/XIX/24',
      responsibleDepartment: 'FD 70',
      responsibleDepartments: ['FD 70'],
      topic: 'Soziales',
      status: 'pending',
      content: 'Das Hallenbad soll grundlegend saniert werden. Geplant sind: Erneuerung der Schwimmbadtechnik, Sanierung der Umkleiden, Installation einer Photovoltaikanlage und Wärmepumpe. Kosten: 2,5 Mio. EUR.',
      dueDate: '2026-03-31',
      reports: []
    }
  ])

  const committees = ref([
    'STVV',
    'Haupt- und Finanzausschuss',
    'Bauausschuss',
    'Sozialausschuss',
    'Umwelt- und Klimaschutzausschuss'
  ])

  const departments = ref([
    'FD 13',
    'FD 10',
    'FD 20',
    'FD 30',
    'FD 40',
    'FD 50',
    'FD 60',
    'FD 70'
  ])

  const topics = ref([
    'Radverkehrskonzept',
    'Straßenbahn',
    'Stadtentwicklung',
    'Umwelt',
    'Bildung',
    'Soziales',
    'Finanzen',
    'Verwaltung'
  ])

  const pendingDecisions = computed(() =>
      decisions.value.filter(d => d.status === 'pending' || d.status === 'in-progress')
  )

  const completedDecisions = computed(() =>
      decisions.value.filter(d => d.status === 'completed')
  )

  function calculateStatus(decision: Decision, ignoreCompleted = false): 'pending' | 'in-progress' | 'completed' {
    if (!ignoreCompleted && decision.status === 'completed') {
      return 'completed'
    }
    if (decision.reports && decision.reports.length > 0) {
      return 'in-progress'
    }
    return 'pending'
  }

  function addDecision(decision: Omit<Decision, 'id' | 'reports' | 'status'>) {
    const newId = Math.max(...decisions.value.map(d => d.id)) + 1
    const newDecision = { ...decision, id: newId, reports: [], status: 'pending' as const }
    decisions.value.push(newDecision)
    return newDecision
  }

  function updateDecision(id: number, updates: Partial<Omit<Decision, 'status'>>) {
    const index = decisions.value.findIndex(d => d.id === id)
    if (index !== -1) {
      decisions.value[index] = { ...decisions.value[index], ...updates }
      decisions.value[index].status = calculateStatus(decisions.value[index])
      return decisions.value[index]
    }
    return null
  }

  function setDecisionCompleted(id: number, completed: boolean) {
    const authStore = useAuthStore()
    const index = decisions.value.findIndex(d => d.id === id)
    if (index !== -1) {
      if (completed) {
        decisions.value[index].status = 'completed'
        decisions.value[index].completedAt = new Date().toISOString()
        decisions.value[index].completedBy = authStore.user?.id
        decisions.value[index].completedByUser = authStore.user ? {
          firstName: authStore.user.first_name,
          lastName: authStore.user.last_name
        } : undefined
      } else {
        decisions.value[index].status = calculateStatus(decisions.value[index], true)
        decisions.value[index].completedAt = undefined
        decisions.value[index].completedBy = undefined
        decisions.value[index].completedByUser = undefined
      }
      return decisions.value[index]
    }
    return null
  }

  function deleteDecision(id: number) {
    const index = decisions.value.findIndex(d => d.id === id)
    if (index !== -1) {
      decisions.value[index].deleted = true
    }
  }

  function addReport(decisionId: number, report: Omit<Report, 'id' | 'createdAt' | 'createdBy' | 'createdByUser'>) {
    const authStore = useAuthStore()
    const decision = decisions.value.find(d => d.id === decisionId)
    if (decision) {
      if (!decision.reports) {
        decision.reports = []
      }
      const newReport: Report = {
        ...report,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        createdBy: authStore.user?.id,
        createdByUser: authStore.user ? {
          firstName: authStore.user.first_name,
          lastName: authStore.user.last_name
        } : undefined
      }
      decision.reports.push(newReport)
      decision.status = calculateStatus(decision)
    }
  }

  function updateReport(decisionId: number, reportId: string, updates: Partial<Report>) {
    const decision = decisions.value.find(d => d.id === decisionId)
    if (decision && decision.reports) {
      const reportIndex = decision.reports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        decision.reports[reportIndex] = { ...decision.reports[reportIndex], ...updates }
      }
    }
  }

  function getCurrentYear(): string {
    const now = new Date()
    const currentYear = now.getFullYear()
    const month = now.getMonth() + 1
    // If we're in the first half of the year, we're still in the previous reporting year
    if (month <= 6) {
      return `${currentYear - 1}/${currentYear}`
    } else {
      return `${currentYear}/${currentYear + 1}`
    }
  }

  function generateYearOptions(): string[] {
    const options: string[] = []
    for (let year = 2010; year <= 2025; year++) {
      options.push(`${year}/${year + 1}`)
    }
    return options
  }

  function generateQuarterOptions(): string[] {
    const options: string[] = []
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const currentQuarter = Math.ceil(currentMonth / 3)

    for (let year = currentYear; year <= currentYear + 5; year++) {
      const startQuarter = year === currentYear ? currentQuarter : 1
      for (let quarter = startQuarter; quarter <= 4; quarter++) {
        options.push(`${year}/Q${quarter}`)
      }
    }
    return options
  }
  return {
    decisions,
    committees,
    departments,
    topics,
    pendingDecisions,
    completedDecisions,
    addDecision,
    updateDecision,
    setDecisionCompleted,
    deleteDecision,
    addReport,
    updateReport,
    getCurrentYear,
    generateYearOptions,
    generateQuarterOptions
  }
})