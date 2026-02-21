/**
 * FSM configs for CRM flows 1–11. Use with createFlowMachine from flowStateMachine.
 * UI is responsible for calling supabaseWrites before/after transitions; these configs define states and events only.
 */

import type { FlowConfig } from '@/lib/flowStateMachine';

// Flow 1: Sales / Contact
export type Flow1State =
  | 'start'
  | 'capture_contact'
  | 'identify_need'
  | 'propose_solution'
  | 'follow_up'
  | 'schedule_demo'
  | 'conduct_demo'
  | 'address_objections'
  | 'agreement_yes'
  | 'send_proposal'
  | 'negotiate'
  | 'finalize'
  | 'onboard'
  | 'end_won'
  | 'agreement_no'
  | 'nurture'
  | 'end_lost';
export type Flow1Event = 'next' | 'yes' | 'no';

export const flow1Config: FlowConfig<Flow1State, Flow1Event> = {
  id: 'flow1-sales',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'capture_contact' } } },
    capture_contact: { on: { next: { target: 'identify_need' } } },
    identify_need: { on: { next: { target: 'propose_solution' } } },
    propose_solution: { on: { next: { target: 'follow_up' } } },
    follow_up: { on: { next: { target: 'schedule_demo' } } },
    schedule_demo: { on: { next: { target: 'conduct_demo' } } },
    conduct_demo: { on: { next: { target: 'address_objections' } } },
    address_objections: { on: { yes: { target: 'agreement_yes' }, no: { target: 'agreement_no' } } },
    agreement_yes: { on: { next: { target: 'send_proposal' } } },
    send_proposal: { on: { next: { target: 'negotiate' } } },
    negotiate: { on: { next: { target: 'finalize' } } },
    finalize: { on: { next: { target: 'onboard' } } },
    onboard: { on: { next: { target: 'end_won' } } },
    end_won: {},
    agreement_no: { on: { next: { target: 'nurture' } } },
    nurture: { on: { next: { target: 'end_lost' } } },
    end_lost: {},
  },
};

// Flow 2: Inquiry / Hot Lead
export type Flow2State = 'start' | 'log_inquiry' | 'hot_yes' | 'assign' | 'sales_call' | 'qualify' | 'present' | 'objections' | 'closed_yes' | 'update_crm' | 'end_won' | 'closed_no' | 'follow_up' | 'end_lost' | 'hot_no' | 'nurture' | 'end_nurture';
export type Flow2Event = 'next' | 'yes' | 'no';

export const flow2Config: FlowConfig<Flow2State, Flow2Event> = {
  id: 'flow2-inquiry',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'log_inquiry' } } },
    log_inquiry: { on: { yes: { target: 'hot_yes' }, no: { target: 'hot_no' } } },
    hot_yes: { on: { next: { target: 'assign' } } },
    assign: { on: { next: { target: 'sales_call' } } },
    sales_call: { on: { next: { target: 'qualify' } } },
    qualify: { on: { next: { target: 'present' } } },
    present: { on: { next: { target: 'objections' } } },
    objections: { on: { yes: { target: 'closed_yes' }, no: { target: 'closed_no' } } },
    closed_yes: { on: { next: { target: 'update_crm' } } },
    update_crm: { on: { next: { target: 'end_won' } } },
    end_won: {},
    closed_no: { on: { next: { target: 'follow_up' } } },
    follow_up: { on: { next: { target: 'end_lost' } } },
    end_lost: {},
    hot_no: { on: { next: { target: 'nurture' } } },
    nurture: { on: { next: { target: 'end_nurture' } } },
    end_nurture: {},
  },
};

// Flow 4: Lead Scoring / Pipeline
export type Flow4State = 'start' | 'lead_enters' | 'scoring' | 'above' | 'assign' | 'outreach' | 'discovery' | 'proposal' | 'opp_yes' | 'pipeline' | 'track' | 'close' | 'end_won' | 'opp_no' | 'requalify' | 'end_requal' | 'below' | 'nurture' | 'end_nurture';
export type Flow4Event = 'next' | 'yes' | 'no';

export const flow4Config: FlowConfig<Flow4State, Flow4Event> = {
  id: 'flow4-lead-score',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'lead_enters' } } },
    lead_enters: { on: { next: { target: 'scoring' } } },
    scoring: { on: { yes: { target: 'above' }, no: { target: 'below' } } },
    above: { on: { next: { target: 'assign' } } },
    assign: { on: { next: { target: 'outreach' } } },
    outreach: { on: { next: { target: 'discovery' } } },
    discovery: { on: { next: { target: 'proposal' } } },
    proposal: { on: { yes: { target: 'opp_yes' }, no: { target: 'opp_no' } } },
    opp_yes: { on: { next: { target: 'pipeline' } } },
    pipeline: { on: { next: { target: 'track' } } },
    track: { on: { next: { target: 'close' } } },
    close: { on: { next: { target: 'end_won' } } },
    end_won: {},
    opp_no: { on: { next: { target: 'requalify' } } },
    requalify: { on: { next: { target: 'end_requal' } } },
    end_requal: {},
    below: { on: { next: { target: 'nurture' } } },
    nurture: { on: { next: { target: 'end_nurture' } } },
    end_nurture: {},
  },
};

// Flow 5: Support / Ticket
export type Flow5State = 'start' | 'create_ticket' | 'assign' | 'diagnose' | 'known_yes' | 'kb_solution' | 'resolve' | 'end' | 'known_no' | 'escalate' | 'research' | 'implement' | 'test' | 'update_kb' | 'communicate' | 'resolve2' | 'end2';
export type Flow5Event = 'next' | 'yes' | 'no';

export const flow5Config: FlowConfig<Flow5State, Flow5Event> = {
  id: 'flow5-support',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'create_ticket' } } },
    create_ticket: { on: { next: { target: 'assign' } } },
    assign: { on: { next: { target: 'diagnose' } } },
    diagnose: { on: { yes: { target: 'known_yes' }, no: { target: 'known_no' } } },
    known_yes: { on: { next: { target: 'kb_solution' } } },
    kb_solution: { on: { next: { target: 'resolve' } } },
    resolve: { on: { next: { target: 'end' } } },
    end: {},
    known_no: { on: { next: { target: 'escalate' } } },
    escalate: { on: { next: { target: 'research' } } },
    research: { on: { next: { target: 'implement' } } },
    implement: { on: { next: { target: 'test' } } },
    test: { on: { next: { target: 'update_kb' } } },
    update_kb: { on: { next: { target: 'communicate' } } },
    communicate: { on: { next: { target: 'resolve2' } } },
    resolve2: { on: { next: { target: 'end2' } } },
    end2: {},
  },
};

// Flow 7: Project
export type Flow7State = 'start' | 'define_scope' | 'assign_resources' | 'develop_plan' | 'execute' | 'monitor' | 'milestone_yes' | 'review' | 'update_status' | 'complete_yes' | 'handover' | 'close' | 'end' | 'complete_no' | 'continue' | 'milestone_no' | 'adjust' | 'end_adj';
export type Flow7Event = 'next' | 'yes' | 'no';

export const flow7Config: FlowConfig<Flow7State, Flow7Event> = {
  id: 'flow7-project',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'define_scope' } } },
    define_scope: { on: { next: { target: 'assign_resources' } } },
    assign_resources: { on: { next: { target: 'develop_plan' } } },
    develop_plan: { on: { next: { target: 'execute' } } },
    execute: { on: { next: { target: 'monitor' } } },
    monitor: { on: { yes: { target: 'milestone_yes' }, no: { target: 'milestone_no' } } },
    milestone_yes: { on: { next: { target: 'review' } } },
    review: { on: { next: { target: 'update_status' } } },
    update_status: { on: { yes: { target: 'complete_yes' }, no: { target: 'complete_no' } } },
    complete_yes: { on: { next: { target: 'handover' } } },
    handover: { on: { next: { target: 'close' } } },
    close: { on: { next: { target: 'end' } } },
    end: {},
    complete_no: { on: { next: { target: 'continue' } } },
    continue: { on: { next: { target: 'execute' } } },
    milestone_no: { on: { next: { target: 'adjust' } } },
    adjust: { on: { next: { target: 'end_adj' } } },
    end_adj: {},
  },
};

// Flow 9: Feature Request
export type Flow9State = 'start' | 'document' | 'prioritize' | 'approved_yes' | 'assign' | 'design' | 'develop' | 'test' | 'deploy' | 'announce' | 'end' | 'approved_no' | 'archive' | 'inform' | 'end_no';
export type Flow9Event = 'next' | 'yes' | 'no';

export const flow9Config: FlowConfig<Flow9State, Flow9Event> = {
  id: 'flow9-feature',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'document' } } },
    document: { on: { next: { target: 'prioritize' } } },
    prioritize: { on: { yes: { target: 'approved_yes' }, no: { target: 'approved_no' } } },
    approved_yes: { on: { next: { target: 'assign' } } },
    assign: { on: { next: { target: 'design' } } },
    design: { on: { next: { target: 'develop' } } },
    develop: { on: { next: { target: 'test' } } },
    test: { on: { next: { target: 'deploy' } } },
    deploy: { on: { next: { target: 'announce' } } },
    announce: { on: { next: { target: 'end' } } },
    end: {},
    approved_no: { on: { next: { target: 'archive' } } },
    archive: { on: { next: { target: 'inform' } } },
    inform: { on: { next: { target: 'end_no' } } },
    end_no: {},
  },
};

// Flow 10: Marketing Asset
export type Flow10State = 'start' | 'brainstorm' | 'draft' | 'review' | 'legal_yes' | 'publish' | 'promote' | 'track' | 'end' | 'legal_no' | 'revise' | 'end_no';
export type Flow10Event = 'next' | 'yes' | 'no';

export const flow10Config: FlowConfig<Flow10State, Flow10Event> = {
  id: 'flow10-marketing',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'brainstorm' } } },
    brainstorm: { on: { next: { target: 'draft' } } },
    draft: { on: { next: { target: 'review' } } },
    review: { on: { yes: { target: 'legal_yes' }, no: { target: 'legal_no' } } },
    legal_yes: { on: { next: { target: 'publish' } } },
    publish: { on: { next: { target: 'promote' } } },
    promote: { on: { next: { target: 'track' } } },
    track: { on: { next: { target: 'end' } } },
    end: {},
    legal_no: { on: { next: { target: 'revise' } } },
    revise: { on: { next: { target: 'review' } } },
    end_no: {},
  },
};

// Flow 11: Data Input (generic validate -> store or reject)
export type Flow11State = 'start' | 'validate' | 'valid_yes' | 'store' | 'process' | 'end' | 'valid_no' | 'reject' | 'notify' | 'end_no';
export type Flow11Event = 'next' | 'yes' | 'no';

export const flow11Config: FlowConfig<Flow11State, Flow11Event> = {
  id: 'flow11-data',
  initial: 'start',
  states: {
    start: { on: { next: { target: 'validate' } } },
    validate: { on: { yes: { target: 'valid_yes' }, no: { target: 'valid_no' } } },
    valid_yes: { on: { next: { target: 'store' } } },
    store: { on: { next: { target: 'process' } } },
    process: { on: { next: { target: 'end' } } },
    end: {},
    valid_no: { on: { next: { target: 'reject' } } },
    reject: { on: { next: { target: 'notify' } } },
    notify: { on: { next: { target: 'end_no' } } },
    end_no: {},
  },
};
