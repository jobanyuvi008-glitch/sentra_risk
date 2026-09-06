/* ==============================================
   DATA.JS — Sentra Bank Mock Data Layer
   Single source of truth for all 5 pages.
   Swap for real API calls in production.
   ============================================== */

const SENTRA_DATA = {

  org: {
    name: 'Sentra Bank Ltd.',
    industry: 'Banking & Financial Services',
    reportDate: 'Sep 2026',
    lastUpdated: 'Sep 6, 2026 — 11:47 PM IST',
    assetsMonitored: 5,
    activeCVEs: 47,
    criticalCVEs: 12,
  },

  /* ————————————————————————————
     DASHBOARD METRICS
  ———————————————————————————— */
  dashboard: {
    riskScore:    74,         // /100
    riskLevel:    'high',
    eal:          4.20,       // Expected Annual Loss, ₹ Crore
    totalExposure: 18.0,      // Max potential loss, ₹ Crore
    riskTrendYoY: '+8.3%',   // year-over-year increase

    // 12-month trend (Oct 2025 – Sep 2026)
    trendLabels:    ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'],
    ealTrend:       [3.10, 3.30, 3.50, 3.62, 3.78, 3.90, 4.02, 4.12, 4.30, 4.22, 4.15, 4.20],
    scoreTrend:     [62,   65,   67,   68,   70,   71,   72,   73,   75,   74,   73,   74  ],
    exposureTrend:  [12.0, 13.0, 14.0, 14.5, 15.0, 15.5, 16.0, 16.5, 17.5, 18.0, 17.8, 18.0],
  },

  /* ————————————————————————————
     TOP RISK CONTRIBUTORS
  ———————————————————————————— */
  topContributors: [
    { name: 'Payment Processing Server', eal: 1.80, level: 'critical' },
    { name: 'Customer Database',         eal: 1.20, level: 'critical' },
    { name: 'Internet Banking Portal',   eal: 0.72, level: 'high'     },
    { name: 'HR & Payroll Server',       eal: 0.28, level: 'medium'   },
    { name: 'Corporate Email Server',    eal: 0.20, level: 'medium'   },
  ],

  /* ————————————————————————————
     RISK COMPOSITION (Donut)
  ———————————————————————————— */
  riskComposition: {
    labels: ['Ransomware', 'Data Breach', 'Insider Threat', 'Phishing', 'Supply Chain'],
    values: [35, 28, 16, 13, 8],
    colors: ['#DC2626', '#EA580C', '#D97706', '#2E5AAC', '#94A3B8'],
  },

  /* ————————————————————————————
     ASSETS
  ———————————————————————————— */
  assets: [
    {
      id: 'payment-server',
      name: 'Payment Processing Server',
      category: 'Core Banking',
      icon: 'credit-card',
      level: 'critical',
      assetValueCr:            45.0,
      likelihoodPct:            78,
      impactCr:                 8.5,
      ealCr:                    1.80,
      criticalCVEs:             12,
      highCVEs:                 18,
      controlEffectivenessPct:  42,
      criticalityScore:         96,
      description: 'Processes all card and wire payment transactions. Direct SWIFT network access. Handles ₹45 Cr in daily transaction volume.',
      riskDrivers: [
        '12 unpatched critical CVEs including CVE-2024-1234 and CVE-2024-5678',
        'Legacy OS components with expired vendor support since Q3 2024',
        'High-value target with ₹45 Cr daily transaction exposure',
        'Insufficient network segmentation from internet-facing services',
      ],
      mitigations: [
        'Emergency patch all 12 critical CVEs — reduces breach likelihood by 35%',
        'Implement strict network segmentation and micro-segmentation',
        'Deploy privileged access management (PAM) for all admin accounts',
      ],
    },
    {
      id: 'customer-db',
      name: 'Customer Database',
      category: 'Data Infrastructure',
      icon: 'database',
      level: 'critical',
      assetValueCr:            32.0,
      likelihoodPct:            65,
      impactCr:                 6.2,
      ealCr:                    1.20,
      criticalCVEs:             8,
      highCVEs:                 22,
      controlEffectivenessPct:  51,
      criticalityScore:         92,
      description: 'Stores PII and financial records for 4.2 million customers. Regulated under GDPR and India DPDP Act 2023.',
      riskDrivers: [
        '4.2M customer records — high attacker incentive for data exfiltration',
        'Regulatory penalty exposure: ₹2.5 Cr fine under DPDP Act',
        'Insufficient access logging and behavioural anomaly detection',
        'Shared credentials detected across 3 high-privilege service accounts',
      ],
      mitigations: [
        'Deploy database activity monitoring (DAM) with real-time alerting',
        'Rotate all service account credentials and enforce unique credentials',
        'Enable column-level encryption for all PII and financial data fields',
      ],
    },
    {
      id: 'internet-banking',
      name: 'Internet Banking Portal',
      category: 'Customer Facing',
      icon: 'globe',
      level: 'high',
      assetValueCr:            28.0,
      likelihoodPct:            58,
      impactCr:                 4.1,
      ealCr:                    0.72,
      criticalCVEs:             4,
      highCVEs:                 11,
      controlEffectivenessPct:  63,
      criticalityScore:         81,
      description: 'Public-facing web banking for 1.8M active users. Primary revenue-generating customer touchpoint and highest-traffic system.',
      riskDrivers: [
        'MFA not enforced for 67% of active user accounts',
        'Credential stuffing attack surface exposed — 3 incidents in last 90 days',
        '4 critical CVEs in underlying Spring Boot framework (unpatched)',
        'Session token entropy below NIST SP 800-63B recommended threshold',
      ],
      mitigations: [
        'Enforce MFA for all 1.8M customer accounts — reduces likelihood by 25%',
        'Implement CAPTCHA and adaptive rate limiting on authentication endpoint',
        'Upgrade Spring Boot framework to latest stable version (v3.3.x)',
      ],
    },
    {
      id: 'hr-server',
      name: 'HR & Payroll Server',
      category: 'Internal Operations',
      icon: 'users',
      level: 'medium',
      assetValueCr:            8.0,
      likelihoodPct:            42,
      impactCr:                 1.8,
      ealCr:                    0.28,
      criticalCVEs:             2,
      highCVEs:                 6,
      controlEffectivenessPct:  71,
      criticalityScore:         58,
      description: 'Manages payroll for 2,400 employees. Contains sensitive employment records, salary structures, and banking details.',
      riskDrivers: [
        'Elevated insider threat risk — 12 users have unrestricted privileged access',
        'Payroll manipulation could trigger reputational and legal consequences',
        'MFA adoption among HR staff at only 34% — majority using passwords only',
        'Data exports to CSV format with no audit trail or DLP enforcement',
      ],
      mitigations: [
        'Enforce MFA for all HR department accounts immediately',
        'Deploy data loss prevention (DLP) rules on all sensitive exports',
        'Conduct monthly access review for all privileged HR user accounts',
      ],
    },
    {
      id: 'email-server',
      name: 'Corporate Email Server',
      category: 'Communication',
      icon: 'mail',
      level: 'medium',
      assetValueCr:            5.0,
      likelihoodPct:            35,
      impactCr:                 1.4,
      ealCr:                    0.20,
      criticalCVEs:             1,
      highCVEs:                 4,
      controlEffectivenessPct:  74,
      criticalityScore:         44,
      description: 'Corporate email infrastructure for all 2,400 staff. Used for internal communications and external client correspondence.',
      riskDrivers: [
        'Primary phishing gateway for ransomware delivery into the organisation',
        'No email attachment sandboxing — all attachments delivered unscanned',
        '23% of staff failed the most recent phishing simulation (Q3 2026)',
        '1 critical CVE in SMTP relay component (CVE-2024-9876, unpatched)',
      ],
      mitigations: [
        'Deploy email sandboxing and enforce DMARC/DKIM/SPF policies',
        'Schedule quarterly security awareness training for all 2,400 staff',
        'Patch SMTP relay component — CVE-2024-9876 (CVSS 9.1)',
      ],
    },
  ],

  /* ————————————————————————————
     SCENARIO SIMULATOR
  ———————————————————————————— */
  scenarios: {
    baseEALCr:       4.20,
    baseLikelihood:  64,    // % weighted average
    baseExposureCr:  18.0,
    baseInvestmentLakhs: 0,

    actions: [
      {
        id: 'mfa',
        name: 'Enable MFA Across All Systems',
        description: 'Enforce multi-factor authentication for all staff and customer accounts (1.8M users + 2,400 employees).',
        costLakhs:               8,
        timelineWeeks:           4,
        likelihoodReductionPct:  22,
        impactReductionPct:      0,
        ealReductionCr:          0.82,
      },
      {
        id: 'patch-cves',
        name: 'Patch Critical Vulnerabilities',
        description: 'Emergency patching cycle for all 12 critical CVEs across Payment Server, Customer DB, and Internet Banking.',
        costLakhs:               15,
        timelineWeeks:           6,
        likelihoodReductionPct:  35,
        impactReductionPct:      0,
        ealReductionCr:          1.15,
      },
      {
        id: 'network-seg',
        name: 'Network Segmentation',
        description: 'Micro-segment payment systems from customer-facing and internal networks using zero-trust architecture.',
        costLakhs:               25,
        timelineWeeks:           10,
        likelihoodReductionPct:  0,
        impactReductionPct:      40,
        ealReductionCr:          1.24,
      },
      {
        id: 'siem',
        name: 'Deploy SIEM & 24×7 Monitoring',
        description: 'Real-time threat detection with automated response playbooks and dedicated security operations center.',
        costLakhs:               20,
        timelineWeeks:           8,
        likelihoodReductionPct:  18,
        impactReductionPct:      15,
        ealReductionCr:          0.72,
      },
      {
        id: 'awareness',
        name: 'Security Awareness Training',
        description: 'Comprehensive phishing simulation and security literacy training for all 2,400 Sentra Bank employees.',
        costLakhs:               5,
        timelineWeeks:           8,
        likelihoodReductionPct:  12,
        impactReductionPct:      0,
        ealReductionCr:          0.28,
      },
    ],
  },

  /* ————————————————————————————
     AI ASSISTANT RESPONSES
  ———————————————————————————— */
  chatResponses: {
    greeting: `Hello! I'm <strong>Sentra AI</strong>, your cyber risk intelligence assistant for Sentra Bank. I can help you understand your financial exposure, identify priority risks, and evaluate security investments.<br><br>Try asking me about your highest risks, recommended fixes, or ROI of specific security controls.`,

    highest_risk: `Your highest financial cyber risk is the <strong>Payment Processing Server</strong>, with an Expected Annual Loss of <strong>₹1.80 Crore</strong>.<br><br>Key drivers: 12 unpatched critical CVEs, legacy OS with no vendor support, and a 78% breach likelihood. Its ₹8.5 Cr potential impact is the largest single exposure in your portfolio. Immediate CVE patching is the highest-ROSI action available.`,

    fix_first: `Based on your current risk profile, here's the recommended remediation priority:<br><br><strong>1. Enable MFA</strong> — ₹8L investment → ₹0.82 Cr EAL reduction (ROSI: 10.3×)<br><strong>2. Patch Critical CVEs</strong> — ₹15L → ₹1.15 Cr EAL reduction (ROSI: 7.7×)<br><strong>3. Network Segmentation</strong> — ₹25L → ₹1.24 Cr reduction (ROSI: 5.0×)<br><br>MFA + Patching together (₹23L) reduces your EAL from <strong>₹4.20 Cr to ₹2.23 Cr</strong> — a 47% improvement.`,

    eal: `Sentra Bank's current total <strong>Expected Annual Loss (EAL) is ₹4.20 Crore</strong> — the probability-weighted annual financial impact across all monitored assets.<br><br><strong>Breakdown:</strong><br>• Payment Processing Server: ₹1.80 Cr<br>• Customer Database: ₹1.20 Cr<br>• Internet Banking Portal: ₹0.72 Cr<br>• HR & Payroll Server: ₹0.28 Cr<br>• Corporate Email Server: ₹0.20 Cr`,

    risk_score: `Sentra Bank's current cyber risk score is <strong>74 / 100 — rated High</strong>.<br><br>This score has increased <strong>8.3% year-over-year</strong>, driven by new CVE discoveries on the Payment Processing Server and expanded internet-facing attack surface. Implementing the top 3 recommended controls is projected to reduce this score to approximately <strong>48 / 100 (Medium)</strong>.`,

    exposure: `Total financial exposure is <strong>₹18.0 Crore</strong> — the theoretical maximum loss if all identified risk scenarios materialised simultaneously.<br><br>This differs from your EAL (₹4.20 Cr), which is probability-weighted. The ₹13.8 Cr gap represents your <strong>risk tail</strong> — the range between expected and worst-case outcomes. This figure is particularly relevant for board-level risk appetite discussions and cyber insurance sizing.`,

    payment: `The <strong>Payment Processing Server</strong> is your most critical asset:<br><br>• <strong>EAL:</strong> ₹1.80 Crore<br>• <strong>Breach likelihood:</strong> 78%<br>• <strong>Potential impact:</strong> ₹8.5 Crore<br>• <strong>Critical CVEs:</strong> 12 unpatched<br>• <strong>Control effectiveness:</strong> Only 42%<br><br>Immediate priority: patch all 12 CVEs (₹15L, reduces likelihood by 35%) and implement network segmentation (₹25L, reduces impact by 40%).`,

    database: `The <strong>Customer Database</strong> is your second-highest risk asset:<br><br>• <strong>EAL:</strong> ₹1.20 Crore<br>• <strong>Breach likelihood:</strong> 65%<br>• <strong>Customer records at risk:</strong> 4.2 million<br>• <strong>Regulatory penalty exposure:</strong> ₹2.5 Cr (DPDP Act)<br>• <strong>Control effectiveness:</strong> 51%<br><br>Top actions: deploy database activity monitoring, rotate service credentials, and encrypt PII at the column level.`,

    mfa: `Enabling MFA across all systems costs <strong>₹8 Lakhs</strong> (rollout + implementation) and reduces breach likelihood by <strong>22%</strong>.<br><br>Estimated <strong>EAL reduction: ₹0.82 Crore</strong>, giving a <strong>ROSI of 10.3×</strong> — the best return on any individual control in your portfolio.<br><br>Current MFA gaps: 67% of Internet Banking users unenrolled, 66% of HR staff unenrolled. Both represent significant credential stuffing exposure.`,

    budget: `Use the <strong>Investment Optimizer</strong> tab to calculate the optimal combination for any specific budget. Quick reference:<br><br>• <strong>₹10L:</strong> Enable MFA → −₹0.82 Cr EAL<br>• <strong>₹25L:</strong> MFA + Patch CVEs → −₹1.97 Cr EAL<br>• <strong>₹50L:</strong> MFA + Patch + SIEM → −₹2.69 Cr EAL<br>• <strong>₹75L:</strong> All controls → −₹3.93 Cr EAL (94% reduction possible)`,

    reduce_risk: `To cut EAL by 50% (from ₹4.20 Cr to ~₹2.10 Cr), the most cost-efficient path:<br><br><strong>1. Patch Critical CVEs</strong> — ₹15L → −₹1.15 Cr<br><strong>2. Enable MFA</strong> — ₹8L → −₹0.82 Cr<br><strong>Total: ₹23L → −₹1.97 Cr (47%)</strong><br><br>Adding <strong>Network Segmentation</strong> (₹25L more) pushes the reduction to ₹3.21 Cr or <strong>76%</strong>, for a total investment of ₹48L.`,

    internet_banking: `The <strong>Internet Banking Portal</strong> has a <strong>High</strong> risk rating:<br><br>• <strong>EAL:</strong> ₹0.72 Crore<br>• <strong>Breach likelihood:</strong> 58%<br>• <strong>Active users at risk:</strong> 1.8 million<br>• <strong>MFA adoption:</strong> Only 33% of users<br><br>The primary driver is absence of enforced MFA — 67% of users authenticate with passwords only, enabling credential stuffing attacks. Enforcing MFA here reduces likelihood by 25% and costs only ₹8L.`,

    email: `The <strong>Corporate Email Server</strong> has a <strong>Medium</strong> risk rating:<br><br>• <strong>EAL:</strong> ₹0.20 Crore<br>• <strong>Breach likelihood:</strong> 35%<br>• <strong>Key risk:</strong> Primary phishing vector for ransomware delivery<br>• <strong>Control effectiveness:</strong> 74% (best of all assets)<br><br>While lowest-EAL, email is often the entry point for higher-impact attacks. Security Awareness Training (₹5L) addresses the 23% phishing failure rate and reduces likelihood by 12%.`,

    rosi: `Return on Security Investment (ROSI) measures risk eliminated per rupee invested. Your portfolio rankings:<br><br>• <strong>Enable MFA:</strong> 10.3× (₹8L → ₹0.82 Cr saved)<br>• <strong>Patch Critical CVEs:</strong> 7.7× (₹15L → ₹1.15 Cr saved)<br>• <strong>Awareness Training:</strong> 5.6× (₹5L → ₹0.28 Cr saved)<br>• <strong>Network Segmentation:</strong> 5.0× (₹25L → ₹1.24 Cr saved)<br>• <strong>SIEM/Monitoring:</strong> 3.6× (₹20L → ₹0.72 Cr saved)`,

    default: `I can help you analyse Sentra Bank's cyber risk posture. Try asking:<br><br>• "What is our highest financial cyber risk?"<br>• "What should we fix first?"<br>• "What is our current EAL?"<br>• "How can we reduce risk by 50%?"<br>• "What is the ROSI for enabling MFA?"<br>• "Tell me about the payment server"<br>• "What is our risk score?"`,
  },
};
