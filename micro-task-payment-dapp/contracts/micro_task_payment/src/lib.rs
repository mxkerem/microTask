// This file contains the Rust code for the smart contract, implementing the logic for managing micro-tasks and payments.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

// Define the data structure for storing task information
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct TaskInfo {
    pub task_id: u32,
    pub freelancer_address: Address,
}

// Storage keys
const TOTAL_TASKS: Symbol = Symbol::new(&Env::current(), "TOTAL_TASKS");
const LAST_TASK: Symbol = Symbol::new(&Env::current(), "LAST_TASK");

#[contract]
pub struct MicroTaskPaymentContract;

#[contractimpl]
impl MicroTaskPaymentContract {
    /// Complete a task and record payment information
    /// This function saves the task completion data to persistent storage
    pub fn complete_task_and_pay(
        env: Env,
        task_id: u32,
        freelancer_address: Address,
        payment_amount: u32,
    ) {
        // Create task info structure
        let task_info = TaskInfo {
            task_id,
            freelancer_address: freelancer_address.clone(),
        };

        // Get current total tasks (default to 0 if not set)
        let current_total: u32 = env
            .storage()
            .persistent()
            .get(&TOTAL_TASKS)
            .unwrap_or(0);

        // Increment total tasks counter
        let new_total = current_total + 1;
        env.storage().persistent().set(&TOTAL_TASKS, &new_total);

        // Store the last task information
        env.storage().persistent().set(&LAST_TASK, &task_info);

        // Log the payment (for debugging/events)
        // Note: In a real contract, you might emit events here
        // For now, we just store the data
    }

    /// Get the total number of paid tasks
    pub fn get_total_paid_tasks(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&TOTAL_TASKS)
            .unwrap_or(0)
    }

    /// Get information about the last paid task
    /// Returns (task_id, freelancer_address)
    pub fn get_last_paid_task_info(env: Env) -> Option<(u32, Address)> {
        let task_info: Option<TaskInfo> = env.storage().persistent().get(&LAST_TASK);
        
        match task_info {
            Some(info) => Some((info.task_id, info.freelancer_address)),
            None => None,
        }
    }
}