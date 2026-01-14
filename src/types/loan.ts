export interface Covenant {
  type: 'financial' | 'reporting' | 'general';
  name: string;
  description: string;
  threshold?: string;
  frequency?: string;
}

export interface ESGTerm {
  target: string;
  margin_adjustment?: string;
  measurement_date?: string;
}

export interface LoanVersion {
  version: number;
  uploaded_at: string;
  uploaded_by: string;
  file_name: string;
  changes?: VersionChange[];
}

export interface VersionChange {
  field: string;
  old_value: string;
  new_value: string;
  change_type: 'commercial' | 'legal';
}

export interface ExtractedField<T = string> {
  value: T;
  confidence: number; // 0-100
  source_page?: number;
  source_text?: string;
}

export interface Loan {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  
  // Core Terms
  borrower: ExtractedField;
  lenders: ExtractedField<string[]>;
  facility_type: ExtractedField;
  principal: ExtractedField;
  currency: ExtractedField;
  interest_margin: ExtractedField;
  maturity_date: ExtractedField;
  
  // Economic Terms
  repayment_schedule: ExtractedField;
  arrangement_fee: ExtractedField;
  commitment_fee: ExtractedField;
  prepayment_terms: ExtractedField;
  
  // Covenants
  covenants: ExtractedField<Covenant[]>;
  reporting_obligations: ExtractedField<string[]>;
  
  // ESG
  esg_linked: ExtractedField<boolean>;
  esg_terms: ExtractedField<ESGTerm[]>;
  
  // Metadata
  versions: LoanVersion[];
  created_at: string;
  updated_at: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'parsing' | 'complete' | 'error';
  progress: number;
  loan_id?: string;
  version?: number;
  error_message?: string;
}
