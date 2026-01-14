import { Loan, UploadedFile } from '@/types/loan';

export const mockLoans: Loan[] = [
  {
    id: 'LN-2024-001',
    status: 'complete',
    borrower: {
      value: 'Meridian Holdings Ltd',
      confidence: 98,
      source_page: 1,
    },
    lenders: {
      value: ['Deutsche Bank AG', 'BNP Paribas SA', 'HSBC Bank plc'],
      confidence: 95,
      source_page: 1,
    },
    facility_type: {
      value: 'Revolving Credit Facility',
      confidence: 99,
      source_page: 2,
    },
    principal: {
      value: '500,000,000',
      confidence: 100,
      source_page: 3,
    },
    currency: {
      value: 'EUR',
      confidence: 100,
      source_page: 3,
    },
    interest_margin: {
      value: 'EURIBOR + 175 bps',
      confidence: 97,
      source_page: 4,
    },
    maturity_date: {
      value: '2029-03-15',
      confidence: 100,
      source_page: 3,
    },
    repayment_schedule: {
      value: 'Bullet repayment at maturity',
      confidence: 94,
      source_page: 8,
    },
    arrangement_fee: {
      value: '50 bps',
      confidence: 92,
      source_page: 12,
    },
    commitment_fee: {
      value: '35% of applicable margin on undrawn amounts',
      confidence: 88,
      source_page: 12,
    },
    prepayment_terms: {
      value: 'Voluntary prepayment permitted with 5 business days notice, no break costs for EURIBOR periods',
      confidence: 85,
      source_page: 15,
    },
    covenants: {
      value: [
        {
          type: 'financial',
          name: 'Interest Cover Ratio',
          description: 'EBITDA to Net Interest Expense',
          threshold: '≥ 4.0x',
          frequency: 'Semi-annual',
        },
        {
          type: 'financial',
          name: 'Net Leverage Ratio',
          description: 'Net Debt to EBITDA',
          threshold: '≤ 3.5x',
          frequency: 'Semi-annual',
        },
        {
          type: 'reporting',
          name: 'Annual Audited Accounts',
          description: 'Delivery of audited consolidated financial statements',
          frequency: '120 days after FY end',
        },
        {
          type: 'reporting',
          name: 'Compliance Certificate',
          description: 'Officer certificate confirming covenant compliance',
          frequency: 'Semi-annual',
        },
      ],
      confidence: 91,
      source_page: 22,
    },
    reporting_obligations: {
      value: [
        'Annual audited financial statements within 120 days',
        'Quarterly management accounts within 45 days',
        'Compliance certificate with each financial delivery',
        'Notification of material litigation within 10 days',
      ],
      confidence: 89,
      source_page: 28,
    },
    esg_linked: {
      value: true,
      confidence: 100,
      source_page: 35,
    },
    esg_terms: {
      value: [
        {
          target: 'Scope 1+2 emissions reduction of 25% by 2027',
          margin_adjustment: '-5 bps if achieved',
          measurement_date: '2027-12-31',
        },
        {
          target: 'Gender diversity target: 40% women in senior management',
          margin_adjustment: '-2.5 bps if achieved',
          measurement_date: '2026-12-31',
        },
      ],
      confidence: 93,
      source_page: 35,
    },
    versions: [
      {
        version: 1,
        uploaded_at: '2024-01-10T14:30:00Z',
        uploaded_by: 'j.martinez@meridian.com',
        file_name: 'Meridian_RCF_Draft_v1.pdf',
      },
      {
        version: 2,
        uploaded_at: '2024-01-18T09:15:00Z',
        uploaded_by: 'j.martinez@meridian.com',
        file_name: 'Meridian_RCF_Draft_v2.pdf',
        changes: [
          {
            field: 'interest_margin',
            old_value: 'EURIBOR + 200 bps',
            new_value: 'EURIBOR + 175 bps',
            change_type: 'commercial',
          },
          {
            field: 'Net Leverage Ratio',
            old_value: '≤ 3.0x',
            new_value: '≤ 3.5x',
            change_type: 'commercial',
          },
        ],
      },
      {
        version: 3,
        uploaded_at: '2024-01-25T16:45:00Z',
        uploaded_by: 's.chen@legalteam.com',
        file_name: 'Meridian_RCF_Final.pdf',
        changes: [
          {
            field: 'prepayment_terms',
            old_value: 'Voluntary prepayment permitted with 10 business days notice',
            new_value: 'Voluntary prepayment permitted with 5 business days notice, no break costs for EURIBOR periods',
            change_type: 'legal',
          },
        ],
      },
    ],
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-25T16:45:00Z',
  },
  {
    id: 'LN-2024-002',
    status: 'complete',
    borrower: {
      value: 'Northwind Infrastructure Partners',
      confidence: 97,
      source_page: 1,
    },
    lenders: {
      value: ['Barclays Bank PLC', 'Société Générale'],
      confidence: 96,
      source_page: 1,
    },
    facility_type: {
      value: 'Term Loan Facility',
      confidence: 99,
      source_page: 2,
    },
    principal: {
      value: '250,000,000',
      confidence: 100,
      source_page: 3,
    },
    currency: {
      value: 'GBP',
      confidence: 100,
      source_page: 3,
    },
    interest_margin: {
      value: 'SONIA + 225 bps',
      confidence: 96,
      source_page: 4,
    },
    maturity_date: {
      value: '2031-06-30',
      confidence: 100,
      source_page: 3,
    },
    repayment_schedule: {
      value: 'Quarterly amortisation of 2.5% from Year 2',
      confidence: 92,
      source_page: 9,
    },
    arrangement_fee: {
      value: '75 bps',
      confidence: 94,
      source_page: 14,
    },
    commitment_fee: {
      value: '40% of applicable margin',
      confidence: 90,
      source_page: 14,
    },
    prepayment_terms: {
      value: 'Make-whole provision for first 3 years, par thereafter',
      confidence: 87,
      source_page: 17,
    },
    covenants: {
      value: [
        {
          type: 'financial',
          name: 'Debt Service Coverage Ratio',
          description: 'Operating Cash Flow to Debt Service',
          threshold: '≥ 1.2x',
          frequency: 'Quarterly',
        },
        {
          type: 'financial',
          name: 'Loan to Value',
          description: 'Outstanding Debt to Asset Value',
          threshold: '≤ 65%',
          frequency: 'Annual',
        },
      ],
      confidence: 89,
      source_page: 24,
    },
    reporting_obligations: {
      value: [
        'Annual audited accounts within 180 days',
        'Quarterly unaudited accounts within 60 days',
        'Annual asset valuation report',
      ],
      confidence: 86,
      source_page: 30,
    },
    esg_linked: {
      value: false,
      confidence: 100,
      source_page: 1,
    },
    esg_terms: {
      value: [],
      confidence: 100,
      source_page: 1,
    },
    versions: [
      {
        version: 1,
        uploaded_at: '2024-02-05T11:20:00Z',
        uploaded_by: 'm.taylor@northwind.co.uk',
        file_name: 'Northwind_TLB_Agreement.pdf',
      },
    ],
    created_at: '2024-02-05T11:20:00Z',
    updated_at: '2024-02-05T11:20:00Z',
  },
  {
    id: 'LN-2024-003',
    status: 'processing',
    borrower: {
      value: 'Atlas Renewables GmbH',
      confidence: 72,
      source_page: 1,
    },
    lenders: {
      value: ['KfW IPEX-Bank GmbH'],
      confidence: 68,
      source_page: 1,
    },
    facility_type: {
      value: 'Project Finance Facility',
      confidence: 75,
      source_page: 2,
    },
    principal: {
      value: '180,000,000',
      confidence: 82,
      source_page: 3,
    },
    currency: {
      value: 'EUR',
      confidence: 100,
      source_page: 3,
    },
    interest_margin: {
      value: 'EURIBOR + 150 bps',
      confidence: 65,
      source_page: 4,
    },
    maturity_date: {
      value: '2038-12-31',
      confidence: 78,
      source_page: 3,
    },
    repayment_schedule: {
      value: 'Sculpted amortisation matching project cash flows',
      confidence: 55,
      source_page: 10,
    },
    arrangement_fee: {
      value: '100 bps',
      confidence: 60,
      source_page: 15,
    },
    commitment_fee: {
      value: '50% of margin during availability',
      confidence: 58,
      source_page: 15,
    },
    prepayment_terms: {
      value: 'Subject to prepayment fee schedule in Schedule 12',
      confidence: 45,
      source_page: 18,
    },
    covenants: {
      value: [],
      confidence: 40,
      source_page: 25,
    },
    reporting_obligations: {
      value: [],
      confidence: 35,
      source_page: 32,
    },
    esg_linked: {
      value: true,
      confidence: 88,
      source_page: 40,
    },
    esg_terms: {
      value: [
        {
          target: 'Renewable energy generation targets',
          margin_adjustment: 'TBD',
        },
      ],
      confidence: 50,
      source_page: 40,
    },
    versions: [
      {
        version: 1,
        uploaded_at: '2024-02-20T08:45:00Z',
        uploaded_by: 'k.schmidt@atlas-renewables.de',
        file_name: 'Atlas_ProjectFinance_Draft.pdf',
      },
    ],
    created_at: '2024-02-20T08:45:00Z',
    updated_at: '2024-02-20T08:45:00Z',
  },
];

export const mockUploadedFiles: UploadedFile[] = [
  {
    id: 'file-001',
    name: 'Meridian_RCF_Final.pdf',
    size: 2456789,
    type: 'application/pdf',
    status: 'complete',
    progress: 100,
    loan_id: 'LN-2024-001',
    version: 3,
  },
  {
    id: 'file-002',
    name: 'Northwind_TLB_Agreement.pdf',
    size: 1823456,
    type: 'application/pdf',
    status: 'complete',
    progress: 100,
    loan_id: 'LN-2024-002',
    version: 1,
  },
  {
    id: 'file-003',
    name: 'Atlas_ProjectFinance_Draft.pdf',
    size: 3245678,
    type: 'application/pdf',
    status: 'parsing',
    progress: 65,
    loan_id: 'LN-2024-003',
    version: 1,
  },
];
