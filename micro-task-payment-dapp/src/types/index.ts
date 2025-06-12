// This file exports TypeScript interfaces and types used throughout the application, ensuring type safety for props and state.

export interface Task {
    id: string;
    title: string;
    description: string;
    reward: number;
    completed: boolean;
}

export interface WalletConnection {
    connected: boolean;
    address: string | null;
}

export interface PaymentDetails {
    taskId: string;
    amount: number;
    recipient: string;
}

export interface TaskInfo {
  taskId: string;
  freelancerAddress: string;
  paymentAmount: string;
  timestamp?: number;
}

export interface ContractState {
  totalTasks: number;
  lastTaskInfo: {
    taskId: number;
    freelancerAddress: string;
  } | null;
}

export interface PaymentFormData {
  taskId: string;
  freelancerAddress: string;
  paymentAmount: string;
}