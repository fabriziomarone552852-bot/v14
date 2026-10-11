// src/mobile/hooks/useMobileRoutineFormLogic.ts
/**
 * Re-export retrocompatibile dell'hook condiviso useRoutineFormLogic.
 * Mantiene la compatibilità con i moduli mobile esistenti delegando al nucleo DRY in hooks/forms.
 */
export {
  useRoutineFormLogic as useMobileRoutineFormLogic,
  type RoutineFormState,
  type UseRoutineFormLogicProps as UseMobileRoutineFormLogicProps,
  type UseRoutineFormLogicReturn as UseMobileRoutineFormLogicReturn,
} from '@/hooks/forms/useRoutineFormLogic';
