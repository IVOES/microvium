import * as IL from './il';

/*
 * Note: We only require references where reference-semantics are observable,
 * which is with arrays and objects. However, functions also have the property
 * that they can recursively reference themselves, making it hard to dump to the
 * console if we need to, so it's convenient to treat functions as reference
 * types.
 */

export type Value =
  | IL.Value
  | FunctionValue
  | ExternalFunctionValue
  | ReferenceValue<Allocation>

export type Frame = InternalFrame | ExternalFrame;

export interface InternalFrame {
  type: 'InternalFrame';
  args: Value[];
  block: IL.Block;
  callerFrame: Frame | undefined;
  filename: string;
  func: IL.Function;
  moduleID: string;
  nextOperationIndex: number;
  object: ReferenceValue<ObjectAllocation> | undefined;
  operationBeingExecuted: IL.Operation;
  variables: Value[];
}

// Indicates where control came from external code
export interface ExternalFrame {
  type: 'ExternalFrame';
  callerFrame: Frame | undefined;
  result: Value;
}

export type ExternalFunctionID = string;

export interface FunctionValue {
  type: 'FunctionValue';
  moduleID: string;
  functionID: string;
}

export interface ExternalFunctionValue {
  type: 'ExternalFunctionValue';
  value: ExternalFunctionID; // Identifier of external function in external function table
}

export interface ReferenceValue<T extends Allocation> {
  type: 'ReferenceValue';
  value: AllocationID;
}

export interface ArrayAllocation {
  type: 'ArrayAllocation';
  allocationID: AllocationID;
  readonly: boolean; // (shallow)
  value: Value[];
}

export interface ObjectAllocation {
  type: 'ObjectAllocation';
  allocationID: AllocationID;
  readonly: boolean; // (shallow)
  value: { [key: string]: Value };
}

export interface VirtualMachineOptions {
  // Function called before every operation
  trace?: (operation: IL.Operation) => void;
}

export type AllocationID = number;

export type Allocation =
  | ArrayAllocation
  | ObjectAllocation

export type ExternalFunctionHandler = (object: Value | undefined, func: ExternalFunctionValue, args: Value[]) => Anchor<Value> | void;

// Anchors are used when we want to reference-count a value rather than expose
// it to the GC. Generally, `Anchor<T>` means that the variable holds ownership.
export interface Anchor<T extends Value> {
  value: T;
  addRef(): Anchor<T>;
  release(): T;
}