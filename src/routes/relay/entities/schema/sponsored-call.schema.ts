import { z } from 'zod';

import { AddressSchema } from '../../../common/schema/address.schema';
import { ChainIdSchema } from '../../../common/schema/chain-id.schema';
import {
  isValidCreateProxyWithNonceCall,
  getOwnersFromCreateProxyWithNonce,
} from './transactions/create-proxy-with-nonce';
import { isValidExecTransactionCall } from './transactions/exec-transaction';
import {
  isValidMultiSendCall,
  getSafeAddressFromMultiSend,
} from './transactions/multi-send';

export const SponsoredCallSchema = z
  .object({
    chainId: ChainIdSchema,
    to: AddressSchema,
    data: z.string(),
    gasLimit: z.optional(z.string().regex(/^\d+$/)).transform((value) => {
      return value ? BigInt(value) : undefined;
    }),
  })
  .transform(async (values, ctx) => {
    const { chainId, to, data } = values;

    const setError = (message: string) => {
      ctx.addIssue({
        message,
        path: ['data'],
        code: z.ZodIssueCode.custom,
      });
    };

    // `execTransaction`
    if (isValidExecTransactionCall(to, data)) {
      return {
        ...values,
        limitAddresses: [to],
      };
    }

    // `multiSend`
    if (isValidMultiSendCall(chainId, to, data)) {
      const safeAddress = getSafeAddressFromMultiSend(data);
      if (!safeAddress) {
        setError('Cannot decode Safe address from `multiSend` transaction');
        return z.NEVER;
      }

      return {
        ...values,
        limitAddresses: [safeAddress],
      };
    }

    // `createProxyWithNonce`
    if (isValidCreateProxyWithNonceCall(chainId, to, data)) {
      return {
        ...values,
        limitAddresses: getOwnersFromCreateProxyWithNonce(data),
      };
    }

    setError(
      'Only Safe creation or (batched) Safe transactions not to self can be relayed',
    );
    return z.NEVER;
  });
