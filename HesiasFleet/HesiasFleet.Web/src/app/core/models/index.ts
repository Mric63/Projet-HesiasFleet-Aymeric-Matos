// Modèles TypeScript alignés 1:1 sur les DTOs de l'API (HesiasFleet.API/DTOs)

// --- Auth / Utilisateurs ---
export interface LoginDto { login: string; password: string; }
export interface AuthResponse { token: string; user: User; }

export interface User {
  id: number;
  lastName: string;
  firstName: string;
  function: string;
  email: string;
  login: string;
}
export interface CreateUser extends Omit<User, 'id'> { password: string; }

// --- Véhicules ---
export interface VehicleProperty { key: string; value: string; }

export interface Vehicle {
  id: number;
  registrationOld?: string | null;
  registrationNew?: string | null;
  customIdentifier?: string | null;
  brand: string;
  model: string;
  mileage: number;
  properties: VehicleProperty[];
}
export type CreateVehicle = Omit<Vehicle, 'id'>;

// --- Magasin / Pièces ---
export interface Part {
  id: number;
  category: string;
  brand: string;
  reference: string;
  minimum: number;
}
export type CreatePart = Omit<Part, 'id'>;

export interface StockStatus {
  partId: number;
  category: string;
  brand: string;
  reference: string;
  minimum: number;
  availableQuantity: number;
  isBelowMinimum: boolean;
}

export interface StockEntryInput { quantity: number; unitCost: number; }
export interface StockConsume { quantity: number; }
export interface StockAdjust { newQuantity: number; }

// --- Opérations ---
export interface OperationConsumable { partId: number; quantity: number; }
export interface OperationSparePart { label: string; unitCost?: number | null; }

export interface Operation {
  id: number;
  vehicleId: number;
  date: string;
  mileage: number;
  label: string;
  deadlineDate?: string | null;
  deadlineMileage?: number | null;
  consumables: OperationConsumable[];
  spareParts: OperationSparePart[];
}
export type CreateOperation = Omit<Operation, 'id'>;

export interface MetaOperation {
  id: number;
  vehicleId: number;
  date: string;
  mileage: number;
  label: string;
  deadlineDate?: string | null;
  deadlineMileage?: number | null;
  operations: Operation[];
}
export interface CreateMetaOperation extends Omit<MetaOperation, 'id' | 'operations'> {
  operations: CreateOperation[];
}

// --- Butées / Notifications ---
export interface DeadlineStatus {
  operationId: number;
  label: string;
  deadlineDate?: string | null;
  daysRemaining?: number | null;
  deadlineMileage?: number | null;
  kilometersRemaining?: number | null;
  isDue: boolean;
}

export interface AppNotification {
  vehicleId: number;
  vehicleLabel: string;
  operationId: number;
  operationLabel: string;
  deadlineDate?: string | null;
  daysRemaining?: number | null;
  deadlineMileage?: number | null;
  kilometersRemaining?: number | null;
}

// --- Notes ---
export interface Note {
  id: number;
  vehicleId: number;
  content: string;
  date: string;
  mileage?: number | null;
  operationId?: number | null;
  metaOperationId?: number | null;
}
export type CreateNote = Omit<Note, 'id'>;

// --- Journal : agrégé côté client à partir des 3 sources ---
export type JournalEntryKind = 'operation' | 'meta' | 'note';

export interface JournalEntry {
  kind: JournalEntryKind;
  date: string;
  mileage?: number | null;
  label: string;
  ref: Operation | MetaOperation | Note;
}
