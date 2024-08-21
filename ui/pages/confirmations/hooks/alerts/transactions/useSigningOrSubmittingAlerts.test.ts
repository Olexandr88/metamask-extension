import {
  TransactionMeta,
  TransactionStatus,
  TransactionType,
} from '@metamask/transaction-controller';
import { Severity } from '../../../../../helpers/constants/design-system';
import { renderHookWithProvider } from '../../../../../../test/lib/render-helpers';
import mockState from '../../../../../../test/data/mock-state.json';
import { ConfirmContextProvider } from '../../../context/confirm';
import * as useCurrentConfirmation from '../../useCurrentConfirmation';
import { useSigningOrSubmittingAlerts } from './useSigningOrSubmittingAlerts';

const TRANSACTION_META_MOCK: Partial<TransactionMeta> = {
  id: '123-456',
  chainId: '0x5',
};

const EXPECTED_ALERT = {
  isBlocking: true,
  key: 'signingOrSubmitting',
  message:
    'This transaction will only go through once your previous transaction is complete.',
  severity: Severity.Warning,
};

const CONFIRMATION_MOCK = {
  type: TransactionType.contractInteraction,
};

function buildState({
  transactions,
}: {
  transactions?: Partial<TransactionMeta>[];
} = {}) {
  return {
    ...mockState,
    metamask: {
      ...mockState.metamask,
      transactions,
    },
  };
}

function runHook({
  transactions,
}: {
  transactions?: Partial<TransactionMeta>[];
} = {}) {
  const state = buildState({ transactions });
  const response = renderHookWithProvider(
    useSigningOrSubmittingAlerts,
    state,
    undefined,
    ConfirmContextProvider,
  );

  return response.result.current;
}

describe('useSigningOrSubmittingAlerts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns no alerts if no confirmation', () => {
    expect(
      runHook({
        transactions: [TRANSACTION_META_MOCK],
      }),
    ).toEqual([]);
  });

  it('returns no alerts if no transactions', () => {
    jest
      .spyOn(useCurrentConfirmation, 'default')
      .mockReturnValue({ currentConfirmation: CONFIRMATION_MOCK });

    expect(runHook({ transactions: [] })).toEqual([]);
  });

  it('returns alerts if transaction on different chain', () => {
    jest
      .spyOn(useCurrentConfirmation, 'default')
      .mockReturnValue({ currentConfirmation: CONFIRMATION_MOCK });

    expect(
      runHook({
        transactions: [
          {
            ...TRANSACTION_META_MOCK,
            status: TransactionStatus.approved,
            chainId: '0x6',
          },
        ],
      }),
    ).toEqual([EXPECTED_ALERT]);
  });

  it('returns no alerts if transaction has alternate status', () => {
    jest
      .spyOn(useCurrentConfirmation, 'default')
      .mockReturnValue({ currentConfirmation: CONFIRMATION_MOCK });

    expect(
      runHook({
        transactions: [
          { ...TRANSACTION_META_MOCK, status: TransactionStatus.submitted },
        ],
      }),
    ).toEqual([]);
  });

  it('returns no alerts if confirmation has incorrect type', () => {
    jest.spyOn(useCurrentConfirmation, 'default').mockReturnValue({
      currentConfirmation: { type: TransactionType.signTypedData },
    });

    expect(
      runHook({
        transactions: [TRANSACTION_META_MOCK],
      }),
    ).toEqual([]);
  });

  it('returns alert if signed transaction', () => {
    jest
      .spyOn(useCurrentConfirmation, 'default')
      .mockReturnValue({ currentConfirmation: CONFIRMATION_MOCK });

    const alerts = runHook({
      transactions: [
        { ...TRANSACTION_META_MOCK, status: TransactionStatus.signed },
      ],
    });

    expect(alerts).toEqual([EXPECTED_ALERT]);
  });

  it('returns alert if approved transaction', () => {
    jest
      .spyOn(useCurrentConfirmation, 'default')
      .mockReturnValue({ currentConfirmation: CONFIRMATION_MOCK });

    const alerts = runHook({
      transactions: [
        { ...TRANSACTION_META_MOCK, status: TransactionStatus.approved },
      ],
    });

    expect(alerts).toEqual([EXPECTED_ALERT]);
  });
});
