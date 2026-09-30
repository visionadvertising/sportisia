export const RECOVERY_SERVICES = [
  'Kinetoterapie',
  'Fizioterapie',
  'Masaj sportiv / terapeutic',
  'Terapie manuală',
  'Recuperare post-accident / post-operatorie sportivă',
  'Evaluare posturală / funcțională',
  'Terapii complementare',
  'Recuperare pediatrică sportivă',
  'Altele'
] as const

export type RecoveryService = (typeof RECOVERY_SERVICES)[number]
