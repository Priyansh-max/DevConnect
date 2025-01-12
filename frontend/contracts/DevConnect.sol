// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DevConnect {
    struct Developer {
        string name;
        string expertise;
        uint256 hourlyRate;
        bool isAvailable;
        bool isRegistered;
    }

    struct CallRequest {
        address client;
        uint256 amount;
        bool accepted;
        bool responded;
    }

    // Array to keep track of all developer addresses
    address[] public developerAddresses;
    
    // Mapping of address to Developer struct
    mapping(address => Developer) public developers;

    // Mapping developer address to their pending call requests
    mapping(address => CallRequest[]) public callRequests;
    
    // Events
    event DeveloperRegistered(address indexed developer, string name, string expertise, uint256 hourlyRate);
    event CallBooked(address indexed developer, address indexed client, uint256 amount);
    event CallCompleted(uint256 callId, uint256 duration);
    event AvailabilityToggled(address indexed developer, bool isAvailable);
    event CallRequested(address indexed developer, address indexed client, uint256 requestId);
    event CallAccepted(address indexed developer, address indexed client, uint256 requestId, string roomId);
    event CallRejected(address indexed developer, address indexed client, uint256 requestId);

    function registerDeveloper(string memory _name, string memory _expertise, uint256 _hourlyRate) public {
        require(!developers[msg.sender].isRegistered, "Developer already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_expertise).length > 0, "Expertise cannot be empty");
        require(_hourlyRate > 0, "Hourly rate must be greater than 0");

        developers[msg.sender] = Developer({
            name: _name,
            expertise: _expertise,
            hourlyRate: _hourlyRate,
            isAvailable: true,
            isRegistered: true
        });

        developerAddresses.push(msg.sender);
        emit DeveloperRegistered(msg.sender, _name, _expertise, _hourlyRate);
    }

    // New function to get total number of developers
    function getDeveloperCount() public view returns (uint256) {
        return developerAddresses.length;
    }

    // New function to get developer address at index
    function getDeveloperAddress(uint256 _index) public view returns (address) {
        require(_index < developerAddresses.length, "Index out of bounds");
        return developerAddresses[_index];
    }

    // Modified function to return more details
    function getDeveloperDetails(address _developer) public view returns (
        string memory name,
        string memory expertise,
        uint256 hourlyRate,
        bool isAvailable,
        bool isRegistered
    ) {
        Developer memory dev = developers[_developer];
        return (
            dev.name,
            dev.expertise,
            dev.hourlyRate,
            dev.isAvailable,
            dev.isRegistered
        );
    }

    // Your existing functions remain the same
    function bookCall(address _developer) public payable {
        require(developers[_developer].isRegistered, "Developer not registered");
        require(developers[_developer].isAvailable, "Developer not available");
        require(msg.value > 0, "Payment required");
        
        uint256 requestId = callRequests[_developer].length;
        callRequests[_developer].push(CallRequest({
            client: msg.sender,
            amount: msg.value,
            accepted: false,
            responded: false
        }));
        
        emit CallRequested(_developer, msg.sender, requestId);
    }

    function completeCall(uint256 _callId, uint256 _duration) public {
        // Your existing implementation
        emit CallCompleted(_callId, _duration);
    }

    function toggleAvailability() public {
        require(developers[msg.sender].isRegistered, "Developer not registered");
        developers[msg.sender].isAvailable = !developers[msg.sender].isAvailable;
        emit AvailabilityToggled(msg.sender, developers[msg.sender].isAvailable);
    }

    function respondToCallRequest(uint256 _requestId, bool _accept) public {
        require(_requestId < callRequests[msg.sender].length, "Invalid request ID");
        CallRequest storage request = callRequests[msg.sender][_requestId];
        require(!request.responded, "Already responded");
        
        request.responded = true;
        request.accepted = _accept;
        
        if (_accept) {
            string memory roomId = string(abi.encodePacked("room-", _requestId));
            emit CallAccepted(msg.sender, request.client, _requestId, roomId);
        } else {
            payable(request.client).transfer(request.amount);
            emit CallRejected(msg.sender, request.client, _requestId);
        }
    }
} 