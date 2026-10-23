// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChatApp {
    struct User {
        string name;
        Friend[] friendList;
    }

    struct Friend {
        address pubkey;
        string name;
    }

    struct Message {
        address sender;
        uint256 timestamp;
        string content;
    }

    struct Group {
        bytes32 groupId;
        string name;
        address[] members;
    }

    struct AllUserStruck {
        string name;
        address accountAddress;
    }

    AllUserStruck[] getAllUsers;

    mapping(address => User) userList;
    mapping(bytes32 => Message[]) allMessages;
    mapping(bytes32 => Group) allGroups;
    mapping(address => bytes32[]) myGroupIds;
    mapping(bytes32 => Message[]) groupMessages;

    // Events for real-time updates
    event AccountCreated(address indexed user, string username, uint256 timestamp);
    event FriendAdded(address indexed user, address indexed friend, string friendName, uint256 timestamp);
    event MessageSent(address indexed sender, address indexed recipient, string encryptedContent, uint256 timestamp);
    event GroupCreated(bytes32 indexed groupId, string name, address indexed creator, uint256 timestamp);
    event GroupMessageSent(bytes32 indexed groupId, address indexed sender, string content, uint256 timestamp);

    // Check if user exists
    function checkUserExists(address pubkey) public view returns (bool) {
        return bytes(userList[pubkey].name).length > 0;
    }

    // Create account
    function createAccount(string calldata name) external {
        require(checkUserExists(msg.sender) == false, "User already exists");
        require(bytes(name).length > 0, "Username cannot be empty");

        userList[msg.sender].name = name;
        getAllUsers.push(AllUserStruck(name, msg.sender));
        
        emit AccountCreated(msg.sender, name, block.timestamp);
    }

    // Get username
    function getUsername(address pubkey) external view returns (string memory) {
        require(checkUserExists(pubkey), "User is not registered");
        return userList[pubkey].name;
    }

    // Add friend
    function addFriend(address friend_key, string calldata name) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered!");
        require(msg.sender != friend_key, "Users cannot add themselves as friends");
        require(checkAlreadyFriends(msg.sender, friend_key) == false, "These users are already friends");

        _addFriend(msg.sender, friend_key, name);
        _addFriend(friend_key, msg.sender, userList[msg.sender].name);
        
        emit FriendAdded(msg.sender, friend_key, name, block.timestamp);
        emit FriendAdded(friend_key, msg.sender, userList[msg.sender].name, block.timestamp);
    }

    // Check if already friends
    function checkAlreadyFriends(address pubkey1, address pubkey2) internal view returns (bool) {
        // Simply iterate over pubkey1's friend list
        // Optimization removed to ensure robust checking
        for (uint256 i = 0; i < userList[pubkey1].friendList.length; i++) {
            if (userList[pubkey1].friendList[i].pubkey == pubkey2) return true;
        }
        return false;
    }

    function _addFriend(address me, address friend_key, string memory name) internal {
        Friend memory newFriend = Friend(friend_key, name);
        userList[me].friendList.push(newFriend);
    }

    // Get my friend list
    function getMyFriendList() external view returns (Friend[] memory) {
        return userList[msg.sender].friendList;
    }

    // Get chat code (unique ID for conversation)
    function _getChatCode(address pubkey1, address pubkey2) internal pure returns (bytes32) {
        if (pubkey1 < pubkey2) {
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        } else {
            return keccak256(abi.encodePacked(pubkey2, pubkey1));
        }
    }

    // Send message
    function sendMessage(address friend_key, string calldata _msg) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(checkAlreadyFriends(msg.sender, friend_key), "You are not friends with this user");

        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        Message memory newMsg = Message(msg.sender, block.timestamp, _msg);
        allMessages[chatCode].push(newMsg);
        
        emit MessageSent(msg.sender, friend_key, _msg, block.timestamp);
    }

    // Read message
    function readMessage(address friend_key) external view returns (Message[] memory) {
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        return allMessages[chatCode];
    }

    // Get all app users
    function getAllAppUser() public view returns (AllUserStruck[] memory) {
        return getAllUsers;
    }

    // ================= GROUP CHAT FUNCTIONALITY =================

    function createGroup(string calldata name, address[] calldata members) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(bytes(name).length > 0, "Group name cannot be empty");
        
        // Generate flexible Group ID (unique mostly)
        bytes32 groupId = keccak256(abi.encodePacked(name, block.timestamp, msg.sender));
        
        // Initialize members list with creator
        address[] memory initialMembers = new address[](members.length + 1);
        initialMembers[0] = msg.sender;
        myGroupIds[msg.sender].push(groupId);

        for(uint256 i=0; i < members.length; i++) {
             // Only add registered users
             if(checkUserExists(members[i])) {
                 initialMembers[i+1] = members[i];
                 if(members[i] != msg.sender) { // Check if not adding self again
                    myGroupIds[members[i]].push(groupId);
                 }
             }
        }

        allGroups[groupId] = Group(groupId, name, initialMembers);
        emit GroupCreated(groupId, name, msg.sender, block.timestamp);
    }

    function sendGroupMessage(bytes32 groupId, string calldata _msg) external {
        require(checkUserExists(msg.sender), "Create an account first");
        require(_checkIsMember(groupId, msg.sender), "You are not a member of this group"); // You are not a member of this group

        Message memory newMsg = Message(msg.sender, block.timestamp, _msg);
        groupMessages[groupId].push(newMsg);

        emit GroupMessageSent(groupId, msg.sender, _msg, block.timestamp);
    }

    function readGroupMessages(bytes32 groupId) external view returns (Message[] memory) {
        require(_checkIsMember(groupId, msg.sender), "You are not a member of this group");
        return groupMessages[groupId];
    }

    function getMyGroups() external view returns (Group[] memory) {
        require(checkUserExists(msg.sender), "Create an account first");
        bytes32[] memory ids = myGroupIds[msg.sender];
        
        Group[] memory groups = new Group[](ids.length);
        
        for(uint256 i=0; i < ids.length; i++) {
            groups[i] = allGroups[ids[i]];
        }
        return groups;
    }

    function _checkIsMember(bytes32 groupId, address user) internal view returns (bool) {
        address[] memory members = allGroups[groupId].members;
        for(uint256 i=0; i < members.length; i++) {
            if(members[i] == user) return true;
        }
        return false;
    }
}
