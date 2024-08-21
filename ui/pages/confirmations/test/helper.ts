import { ApprovalType, ChainId } from '@metamask/controller-utils';
import {
  TransactionStatus,
  TransactionType,
} from '@metamask/transaction-controller';

import mockState from '../../../../test/data/mock-state.json';

type RootState = { metamask: Record<string, unknown> } & Record<
  string,
  unknown
>;

export const getExampleMockConfirmState = (args: RootState) => ({
  ...mockState,
  ...args,
  metamask: {
    ...mockState.metamask,
    preferences: {
      redesignedTransactionsEnabled: true,
      redesignedConfirmationsEnabled: true,
      isRedesignedConfirmationsDeveloperEnabled: true,
    },
    pendingApprovals: {
      123: {
        id: 123,
        type: ApprovalType.EthSignTypedData,
      },
    },
    unapprovedTypedMessages: {
      123: {
        id: 123,
        chainId: mockState.metamask.providerConfig.chainId,
        type: TransactionType.signTypedData,
        status: TransactionStatus.unapproved,
      },
    },
    ...args.metamask,
  },
});

export const getMockConfirmState = (args: RootState) => ({
  ...mockState,
  ...args,
  metamask: {
    ...mockState.metamask,
    preferences: {
      redesignedTransactionsEnabled: true,
      redesignedConfirmationsEnabled: true,
      isRedesignedConfirmationsDeveloperEnabled: true,
    },
    ...args.metamask,
  },
});
