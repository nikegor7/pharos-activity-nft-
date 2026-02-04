'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Month, type ChainId } from '@/types';
import { ACTIVITY_NFT_ABI, getContractAddress } from '@/lib/contracts';

interface UseMintReturn {
  hasMinted: boolean;
  isLoadingMintStatus: boolean;
  isMinting: boolean;
  isConfirming: boolean;
  mint: () => void;
  error: string | null;
  txHash: `0x${string}` | undefined;
  isSuccess: boolean;
  reset: () => void;
}

export function useMint(chainSlug: ChainId, month: Month): UseMintReturn {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const contractAddress = getContractAddress(chainSlug, month);

  // Check if user has already minted
  const {
    data: hasMintedData,
    isLoading: isLoadingMintStatus,
    refetch: refetchMintStatus,
  } = useReadContract({
    address: contractAddress,
    abi: ACTIVITY_NFT_ABI,
    functionName: 'hasMinted',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress && contractAddress !== '0x',
    },
  });

  // Write contract hook
  const {
    writeContract,
    data: txHash,
    isPending: isMinting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Refetch mint status after successful mint
  useEffect(() => {
    if (isSuccess) {
      refetchMintStatus();
    }
  }, [isSuccess, refetchMintStatus]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || 'Failed to mint');
    } else if (confirmError) {
      setError(confirmError.message || 'Transaction failed');
    }
  }, [writeError, confirmError]);

  const mint = useCallback(() => {
    if (!contractAddress || contractAddress === '0x' || !isConnected) {
      setError('Wallet not connected or contract not deployed');
      return;
    }

    setError(null);
    writeContract({
      address: contractAddress,
      abi: ACTIVITY_NFT_ABI,
      functionName: 'mint',
    });
  }, [contractAddress, isConnected, writeContract]);

  const reset = useCallback(() => {
    setError(null);
    resetWrite();
  }, [resetWrite]);

  return {
    hasMinted: hasMintedData ?? false,
    isLoadingMintStatus,
    isMinting,
    isConfirming,
    mint,
    error,
    txHash,
    isSuccess,
    reset,
  };
}
