export interface Fund {
  id: string
  isin_code: string | null
  morocco_code: string | null
  name: string
  code: string | null
  type: 'OPCVM' | 'OPCI'
  management_company: string | null
  legal_nature: string | null
  classification: string | null
  benchmark_index: string | null
  subscription_fee: number | null
  redemption_fee: number | null
  management_fees: number | null
  nav: number | null
  asset_value: number | null
  ytd_performance: number | null
  perf_1d: number | null
  perf_1w: number | null
  perf_1m: number | null
  perf_3m: number | null
  perf_6m: number | null
  perf_1y: number | null
  perf_2y: number | null
  perf_3y: number | null
  perf_5y: number | null
  depositary: string | null
  distributor: string | null
  risk_level: number | null
  category: string | null
  description: string | null
  minimum_investment: number | null
  performance_fees: number | null
  inception_date: string | null
  is_active: boolean
  documents: any
  created_at: string
  updated_at: string
}
