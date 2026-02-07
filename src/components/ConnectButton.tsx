'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { getChainById } from '@/lib/chains';

const WALLET_ICONS: Record<string, string> = {
  MetaMask: '🦊',
  WalletConnect: '🔗',
  'Coinbase Wallet': '🔵',
};

function getConnectorName(connector: { name: string; id: string }): string {
  if (connector.id === 'injected') return 'Browser Wallet';
  return connector.name;
}

function getConnectorIcon(connector: { name: string; id: string }): string {
  if (connector.id === 'injected') return '🌐';
  return WALLET_ICONS[connector.name] || '💼';
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || 'w-4 h-4'}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || 'w-4 h-4'}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function WalletInfo({ address }: { address: `0x${string}` }) {
  const { chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const chainConfig = chain ? getChainById(chain.id) : null;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const formattedBalance = balance
    ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ${balance.symbol}`
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-750 hover:border-gray-600 transition-colors"
      >
        {/* Chain indicator dot */}
        {chainConfig && (
          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${chainConfig.iconColor}`} />
        )}

        {/* Balance */}
        {formattedBalance && (
          <span className="text-sm font-medium text-gray-300">
            {formattedBalance}
          </span>
        )}

        {/* Address pill */}
        <span className="px-2 py-0.5 text-sm font-mono text-white bg-gray-700 rounded-lg">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Chain info */}
          {chainConfig && (
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${chainConfig.iconColor}`} />
                <span className="text-sm font-medium text-white">{chainConfig.name}</span>
              </div>
              <span className="text-xs text-gray-500 mt-0.5 block">
                Chain ID: {chainConfig.id}
              </span>
            </div>
          )}

          {/* Address + copy */}
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Address</div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-mono text-gray-300 truncate">
                {address}
              </span>
              <button
                onClick={copyAddress}
                className="flex-shrink-0 p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-400" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Balance */}
          {formattedBalance && (
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="text-xs text-gray-500 mb-1">Balance</div>
              <span className="text-sm font-medium text-white">{formattedBalance}</span>
            </div>
          )}

          {/* Disconnect */}
          <div className="p-2">
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors text-left"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConnectButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    }
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModal]);

  if (!mounted) {
    return (
      <button
        disabled
        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg opacity-50"
      >
        Connect Wallet
      </button>
    );
  }

  if (isConnected && address) {
    return <WalletInfo address={address} />;
  }

  // Deduplicate connectors by id, MetaMask first
  const uniqueConnectors = connectors
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .sort((a, b) => {
      const aIsMetaMask = a.id === 'io.metamask' || a.name === 'MetaMask' ? -1 : 0;
      const bIsMetaMask = b.id === 'io.metamask' || b.name === 'MetaMask' ? -1 : 0;
      return aIsMetaMask - bIsMetaMask;
    });

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(true)}
        disabled={isConnecting}
        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            ref={modalRef}
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Connect Wallet</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {uniqueConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setShowModal(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <span className="text-2xl">{getConnectorIcon(connector)}</span>
                  <span className="font-medium">{getConnectorName(connector)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
