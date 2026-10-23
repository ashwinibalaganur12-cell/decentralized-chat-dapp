import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import RealTimeUpdates from './components/RealTimeUpdates.jsx';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ConnectWallet from './components/ConnectWallet';
import RegisterModal from './components/RegisterModal';
import AddFriendModal from './components/AddFriendModal';
import SettingsModal from './components/SettingsModal';
import StatusModal from './components/StatusModal';
import CreateGroupModal from './components/CreateGroupModal';
import { useChatContract } from './hooks/useChatContract';
import { handleContractError } from './utils/errorHandler';
import { CONTRACT_ADDRESS } from './config/contract';
import { encryptMessage, decryptMessage } from './utils/encryption';
import './index.css';

import { ethers } from 'ethers';

// Hardhat default account #0 private key (Testnet only!)
// Hardhat default account #0 private key (Testnet only!)
const FUNDER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// START CACHE BUSTER
const APP_VERSION = "v1.2.0-debug-selector";

function App() {
  // Cache Buster Effect
  useEffect(() => {
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      console.log(`Version mismatch! Clearing cache. New: ${APP_VERSION}, Old: ${storedVersion}`);
      // Clear specific items or everything
      localStorage.removeItem('wallet_info'); // Force re-login
      localStorage.clear(); // Nuclear option since we had major sync issues
      localStorage.setItem('app_version', APP_VERSION);

      // Reload if we found an old version to ensure clean slate
      if (storedVersion) {
        toast.success("App updated! Reloading...", { duration: 3000 });
        setTimeout(() => window.location.reload(), 1500);
      }
    }
  }, []);
  // END CACHE BUSTER

  // Wallet state
  const [walletInfo, setWalletInfo] = useState(null);
  const [account, setAccount] = useState(null);

  // User state
  const [username, setUsername] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Chat state
  const [friendList, setFriendList] = useState([]);
  const [groupList, setGroupList] = useState([]); // New group state
  const [activeChat, setActiveChat] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false); // New modal state
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Initialize contract hook
  const chatContract = useChatContract(walletInfo?.signer);

  // Auto-fund wallet if balance is low
  const checkAndFundWallet = async (address, provider) => {
    try {
      const balance = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balance);

      if (parseFloat(balanceEth) < 0.1) {
        toast.loading('Insufficient funds detected. Auto-funding...', { id: 'fund-toast' });

        // Create funder wallet connected to the same provider
        const funderWallet = new ethers.Wallet(FUNDER_PRIVATE_KEY, provider);

        const tx = await funderWallet.sendTransaction({
          to: address,
          value: ethers.parseEther("10.0")
        });

        await tx.wait();
        toast.success(`Funded wallet with 10 ETH!`, { id: 'fund-toast' });
        console.log(`Funded ${address} with 10 ETH. Tx: ${tx.hash}`);
        return true;
      }
    } catch (error) {
      console.error("Auto-fund failed:", error);
      toast.error("Failed to auto-fund wallet");
    }
    return false;
  };

  // Handle wallet connection
  const handleWalletConnect = async (wallet) => {
    console.log('Wallet connected:', wallet);
    setWalletInfo(wallet);
    setAccount(wallet.address);

    // Check and fund wallet
    await checkAndFundWallet(wallet.address, wallet.provider);

    // Check if contract is deployed
    if (CONTRACT_ADDRESS === "YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE") {
      toast.error('Contract not deployed yet. Please deploy the contract first.');
      return;
    }

    // Check if user exists in the contract (using direct RPC for reliability)
    setTimeout(async () => {
      try {
        // Use readContract (direct RPC) for more reliable read operations
        const contractToCheck = chatContract.readContract || chatContract.contract;
        if (contractToCheck) {
          const userExists = await chatContract.checkUserExists(wallet.address);

          if (userExists) {
            const name = await chatContract.getUsername(wallet.address);
            setUsername(name);
            console.log('User found:', name);
            toast.success(`Welcome back, ${name}!`);

            console.log('User found:', name);
            toast.success(`Welcome back, ${name}!`);

            // Friend list will be loaded by the useEffect when contract is ready
          } else {
            console.log('New user - account creation required');
            setShowRegisterModal(true);
          }
        } else {
          console.log('Contract not ready yet, retrying...');
          // Retry after another delay
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch (err) {
        console.error('Error checking user:', err);
        const errorMessage = handleContractError(err);
        toast.error(errorMessage);
      }
    }, 500); // Reduced delay since direct RPC is faster
  };

  // Effect to load friends when user is authenticated and contract is ready
  useEffect(() => {
    if (username && chatContract.contract) {
      console.log("Contract ready and user logged in, loading friends and groups...");
      loadFriendList();
      loadGroups();
    }
  }, [username, chatContract.contract]);


  // Load friend list from blockchain
  const loadFriendList = async () => {
    try {
      const friends = await chatContract.getFriendList();
      const formattedFriends = friends.map((friend, index) => ({
        id: index + 1,
        name: friend.name,
        address: friend.pubkey,
        lastMessage: 'Tap to load messages',
        timestamp: Date.now(),
      }));
      setFriendList(formattedFriends);
      console.log('Loaded friends:', formattedFriends);
    } catch (err) {
      console.error('Error loading friend list:', err);
    }
  };

  // Load groups from blockchain
  const loadGroups = async () => {
    try {
      const groups = await chatContract.getMyGroups();

      const formattedGroups = groups.map((group) => {
        return {
          id: group.groupId || group[0],
          name: group.name || group[1],
          members: group.members || group[2],
          type: 'group', // Distinguish from friends
          lastMessage: 'Tap to chat',
          timestamp: Date.now(),
        };
      });
      setGroupList(formattedGroups);
      console.log('Loaded groups:', formattedGroups);
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  // Load messages for active chat
  const loadMessages = async (chat) => {
    if (!chat) return;

    setIsLoadingMessages(true);
    try {
      let msgs;
      if (chat.type === 'group') {
        msgs = await chatContract.readGroupMessages(chat.id);
      } else {
        msgs = await chatContract.readMessages(chat.address);
      }

      const formattedMessages = msgs.map((msg, index) => {
        // Decrypt message content (Simple definition for groups: no encryption for now as per plan/MVP)
        // If 1:1, decrypt. If group, plain text or simple global key (skipping complex group encryption for MVP)
        let content = msg.content;

        if (chat.type !== 'group') {
          try {
            content = decryptMessage(msg.content, walletInfo.address, chat.address);
          } catch (e) {
            console.warn("Failed to decrypt message", e);
            content = "[Encrypted Message]";
          }
        }

        return {
          id: index,
          content: content,
          timestamp: Number(msg.timestamp) * 1000,
          isOwn: msg.sender.toLowerCase() === walletInfo.address.toLowerCase(),
          senderAddress: msg.sender, // Useful for displaying sender name in groups
          sent: true,
          delivered: true,
          read: true,
        };
      });

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Handle registration success
  const handleRegisterSuccess = (name) => {
    setUsername(name);
    setShowRegisterModal(false);
    toast.success(`Welcome, ${name}!`);
  };

  // Handle add friend success
  const handleAddFriendSuccess = async () => {
    await loadFriendList();
  };

  // Handle opening add friend modal
  const handleOpenAddFriend = () => {
    if (!username) {
      toast.error('Please register an account first before adding friends');
      setShowRegisterModal(true);
      return;
    }
    setShowAddFriendModal(true);
  };

  // Handle send message
  const handleSendMessage = async (content) => {
    if (!activeChat) return false;

    // Optimistically add message
    const tempMessage = {
      id: Date.now(),
      content,
      timestamp: Date.now(),
      isOwn: true,
      sent: false,
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      if (activeChat.type === 'group') {
        // Send group message (Plain text for MVP)
        // Wrapper handles wait() internally
        await chatContract.sendGroupMessage(activeChat.id, content, { gasLimit: 5000000 });
      } else {
        // Encrypt and send 1:1
        const encrypted = encryptMessage(content, walletInfo.address, activeChat.address);
        await chatContract.sendMessage(activeChat.address, encrypted, { gasLimit: 5000000 });
      }

      toast.success('Message sent!');

      // Reload messages
      setTimeout(() => loadMessages(activeChat), 2000);
      return true;

    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      toast.error(handleContractError(error));
      throw error;
    }
  };

  // Handle chat selection
  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    loadMessages(chat);
  };

  // Handle logout
  const handleLogout = () => {
    setWalletInfo(null);
    setAccount(null);
    setUsername(null);
    setActiveChat(null);
    setMessages([]);
    setFriendList([]);
    toast.success('Logged out successfully');
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setWalletInfo(null);
          setAccount(null);
          setUsername(null);
          setActiveChat(null);
          setMessages([]);
          setFriendList([]);
        } else {
          // Account changed - reload page
          window.location.reload();
        }
      });

      return () => {
        window.ethereum.removeAllListeners('accountsChanged');
      };
    }
  }, []);

  // Poll for new messages when chat is active
  useEffect(() => {
    if (!activeChat || !username) return;

    const interval = setInterval(() => {
      loadMessages(activeChat);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [activeChat, username]);

  // If wallet not connected, show connect screen
  if (!walletInfo) {
    return (
      <>
        <ConnectWallet onConnect={handleWalletConnect} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <Layout
        sidebar={
          <Sidebar
            account={account}
            username={username}
            friendList={friendList}
            groupList={groupList} // Pass groups
            activeChat={activeChat?.id}
            onSelectChat={handleSelectChat}
            onNewChat={handleOpenAddFriend}
            onCreateGroup={() => setShowCreateGroupModal(true)} // Handle create group
            onRegister={() => setShowRegisterModal(true)}
            onLogout={handleLogout}
            onSettings={() => setShowSettingsModal(true)}
            onStatus={() => setShowStatusModal(true)}
          />
        }
      >
        <ChatWindow
          activeChat={activeChat}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingMessages}
          friendList={friendList}
        />
        {/* Real-time updates via contract events */}
        {walletInfo && activeChat && (
          <RealTimeUpdates
            walletInfo={walletInfo}
            activeChat={activeChat}
            onNewMessage={(msg) => setMessages((prev) => [...prev, msg])}
          />
        )}
      </Layout>

      {/* Modals */}
      {showRegisterModal && (
        <RegisterModal
          walletInfo={walletInfo}
          onSuccess={handleRegisterSuccess}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      {showAddFriendModal && username && (
        <AddFriendModal
          walletInfo={walletInfo}
          onSuccess={handleAddFriendSuccess}
          onClose={() => setShowAddFriendModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          walletInfo={walletInfo}
          username={username}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          friendList={friendList}
          onGroupCreated={loadGroups}
          createGroup={chatContract.createGroup}
        />
      )}

      {showStatusModal && (
        <StatusModal
          username={username}
          onClose={() => setShowStatusModal(false)}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
