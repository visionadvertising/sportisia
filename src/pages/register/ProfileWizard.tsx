import RegisterCoach from './RegisterCoach'
import RegisterEquipmentShop from './RegisterEquipmentShop'
import RegisterRepairShop from './RegisterRepairShop'
import RegisterSportsRecovery from './RegisterSportsRecovery'
import RegisterSportsBase from './RegisterSportsBase'
import type { ProfileCompletion } from './completion'

export default function ProfileWizard({ type, completion }: { type: string; completion: ProfileCompletion }) {
  if (type === 'coach') return <RegisterCoach completion={completion} />
  if (type === 'repair_shop') return <RegisterRepairShop completion={completion} />
  if (type === 'sports_recovery') return <RegisterSportsRecovery completion={completion} />
  if (type === 'equipment_shop') return <RegisterEquipmentShop completion={completion} />
  return <RegisterSportsBase completion={completion} />
}
