import { getAddress, isAddress } from 'ethers';
import { z } from 'zod';

export const AddressSchema = z.string().refine(isAddress).transform(getAddress);
