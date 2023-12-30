import { useMemo, useState } from 'react';

type State = { isOn: boolean };
type ItemResult = State & { on: () => void; off: () => void };
type Result = { allOn: () => void; allOff: () => void };

/**
 * Toggle state hook by Carlos Camacho
 * "one hook at a time"
 */
export default function useToggleState<T extends string>(
  identifiers: T[]
): Record<T, ItemResult> & Result {
  const [states, setStates] = useState<Record<T, State>>(
    identifiers.reduce((acc, field) => {
      acc[field] = { isOn: false };
      return acc;
    }, {} as Record<T, State>)
  );

  const results = useMemo(
    () => ({
      ...identifiers.reduce((acc, field) => {
        const state = states[field as T];
        acc[field] = {
          ...state,
          on: () => {
            setStates({
              ...states,
              [field]: { ...state, isOn: true },
            });
          },
          off: () => {
            setStates({
              ...states,
              [field]: { ...state, isOn: false },
            });
          },
        };
        return acc;
      }, {} as Record<T, ItemResult>),
      allOn: () => {
        setStates((s) => {
          const newState = { ...s };
          Object.keys(newState).forEach((key) => {
            newState[key as T].isOn = true;
          });
          return newState;
        });
      },
      allOff: () => {
        setStates((s) => {
          const newState = { ...s };
          Object.keys(newState).forEach((key) => {
            newState[key as T].isOn = false;
          });
          return newState;
        });
      },
    }),
    [identifiers, states]
  );

  return results;
}
