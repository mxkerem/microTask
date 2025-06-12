'use client';

import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  Address,
  xdr,
  Contract,
  Account,
} from 'stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// Contract configuration
const CONTRACT_ADDRESS = 'your-deployed-contract-address'; // TODO: Replace with actual deployed contract address
const NETWORK_PASSPHRASE = Networks.TESTNET;
const RPC_URL = 'https://soroban-testnet.stellar.org';

// Initialize Soroban RPC server
const server = new SorobanRpc.Server(RPC_URL);

export interface ContractService {
  completeTaskAndPay: (taskId: number, freelancerAddress: string, paymentAmount: number, userAddress: string) => Promise<string>;
  getTotalPaidTasks: () => Promise<number>;
  getLastPaidTaskInfo: () => Promise<{ taskId: number; freelancerAddress: string } | null>;
}

export const stellarService: ContractService = {
  /**
   * Complete a task and record payment - calls the Soroban contract
   */
  async completeTaskAndPay(taskId: number, freelancerAddress: string, paymentAmount: number, userAddress: string): Promise<string> {
    try {
      console.log('🚀 Calling contract with:', { taskId, freelancerAddress, paymentAmount, userAddress });

      // Get user account info
      const sourceAccount = await server.getAccount(userAddress);
      
      // Create contract instance
      const contract = new Contract(CONTRACT_ADDRESS);
      
      // Build transaction to call complete_task_and_pay function  
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            'complete_task_and_pay',
            nativeToScVal(taskId, { type: 'u32' }),
            nativeToScVal(freelancerAddress, { type: 'address' }),
            nativeToScVal(paymentAmount, { type: 'u32' })
          )
        )
        .setTimeout(30)
        .build();

      // Prepare transaction for simulation
      const preparedTransaction = await server.prepareTransaction(transaction);

      // Sign transaction with Freighter
      const { signedTxXdr } = await signTransaction(preparedTransaction.toXDR(), {
        network: 'TESTNET',
        address: userAddress,
      });

      // Submit transaction
      const signedTransaction = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
      const response = await server.sendTransaction(signedTransaction);

      console.log('✅ Contract call successful:', response);
      return response.hash;
    } catch (error) {
      console.error('❌ Contract call failed:', error);
      throw new Error(`Failed to complete task and pay: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get total number of paid tasks from contract
   */
  async getTotalPaidTasks(): Promise<number> {
    try {
      // Create a "dummy" account for read-only operations
      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      
      // Create contract instance
      const contract = new Contract(CONTRACT_ADDRESS);
      
      // Build read-only transaction
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_total_paid_tasks'))
        .setTimeout(30)
        .build();

      // Simulate transaction to get result
      const response = await server.simulateTransaction(transaction);
      
      if (response.error) {
        throw new Error(`Simulation failed: ${response.error}`);
      }

      // Parse result
      const resultScVal = response.result?.retval;
      if (resultScVal) {
        return resultScVal.u32() || 0;
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Failed to get total tasks:', error);
      return 0; // Return 0 on error for graceful fallback
    }
  },

  /**
   * Get last paid task info from contract
   */
  async getLastPaidTaskInfo(): Promise<{ taskId: number; freelancerAddress: string } | null> {
    try {
      // Create a "dummy" account for read-only operations
      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      
      // Create contract instance
      const contract = new Contract(CONTRACT_ADDRESS);
      
      // Build read-only transaction
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(contract.call('get_last_paid_task_info'))
        .setTimeout(30)
        .build();

      // Simulate transaction to get result
      const response = await server.simulateTransaction(transaction);
      
      if (response.error) {
        throw new Error(`Simulation failed: ${response.error}`);
      }

      // Parse result - contract returns Option<(u32, Address)>
      const resultScVal = response.result?.retval;
      if (resultScVal && resultScVal.switch().name === 'scvInstanceType' && resultScVal.instance().instanceType().name === 'instanceTypeContractInstance') {
        // Handle Option::Some case
        const tupleVal = resultScVal.instance().instance();
        if (tupleVal && tupleVal.length === 2) {
          const taskId = tupleVal[0].u32();
          const freelancerAddress = Address.fromScVal(tupleVal[1]).toString();
          return { taskId, freelancerAddress };
        }
      }
      
      return null; // Option::None case
    } catch (error) {
      console.error('❌ Failed to get last task info:', error);
      return null; // Return null on error for graceful fallback
    }
  },
};

// Helper function to check if contract is deployed and accessible
export const checkContractConnection = async (): Promise<boolean> => {
  try {
    await stellarService.getTotalPaidTasks();
    return true;
  } catch (error) {
    console.warn('⚠️ Contract not accessible:', error);
    return false;
  }
};