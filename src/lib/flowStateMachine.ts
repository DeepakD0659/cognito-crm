/** Lightweight generic state machine for workflow flows */

export interface FlowConfig<S extends string, E extends string> {
  id: string;
  initial: S;
  states: Record<S, {
    on?: Partial<Record<E, { target: S; guard?: () => boolean; action?: () => void }>>;
    onEntry?: () => void;
    onExit?: () => void;
  }>;
  onError?: (error: Error, state: S) => void;
}

export interface FlowInstance<S extends string, E extends string> {
  current: S;
  send: (event: E) => boolean;
  canSend: (event: E) => boolean;
  reset: () => void;
  history: Array<{ from: S; to: S; event: E; timestamp: Date }>;
}

export function createFlowMachine<S extends string, E extends string>(
  config: FlowConfig<S, E>
): FlowInstance<S, E> {
  let current = config.initial;
  const history: FlowInstance<S, E>['history'] = [];

  const instance: FlowInstance<S, E> = {
    get current() { return current; },
    
    canSend(event: E): boolean {
      const stateConfig = config.states[current];
      const transition = stateConfig?.on?.[event];
      if (!transition) return false;
      if (transition.guard && !transition.guard()) return false;
      return true;
    },

    send(event: E): boolean {
      const stateConfig = config.states[current];
      const transition = stateConfig?.on?.[event];
      
      if (!transition) {
        console.warn(`[FSM:${config.id}] No transition for event "${event}" in state "${current}"`);
        return false;
      }

      if (transition.guard && !transition.guard()) {
        console.warn(`[FSM:${config.id}] Guard blocked transition "${event}" in state "${current}"`);
        return false;
      }

      try {
        stateConfig.onExit?.();
        const from = current;
        current = transition.target;
        transition.action?.();
        config.states[current]?.onEntry?.();
        history.push({ from, to: current, event, timestamp: new Date() });
        return true;
      } catch (error) {
        config.onError?.(error as Error, current);
        return false;
      }
    },

    reset() {
      current = config.initial;
      history.length = 0;
    },

    history,
  };

  // Run initial state's onEntry
  config.states[config.initial]?.onEntry?.();

  return instance;
}
