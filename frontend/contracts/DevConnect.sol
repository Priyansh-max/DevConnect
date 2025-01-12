// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DevConnect {
    struct Developer {
        string name;
        string expertise;
        uint256 hourlyRate;
        bool isActive;
        uint256 totalCalls;
        mapping(uint256 => Call) calls;
    }

    struct Call {
        address client;
        uint256 timestamp;
        uint256 duration; // in minutes
        bool completed;
        bool paid;
    }

    mapping(address => Developer) public developers;
    mapping(address => bool) public isDeveloper;
    uint256 public platformFee = 5; // 5% platform fee

    event DeveloperRegistered(address indexed developer, string name, uint256 hourlyRate);
    event CallBooked(address indexed developer, address indexed client, uint256 timestamp);
    event CallCompleted(address indexed developer, address indexed client, uint256 duration);

    modifier onlyDeveloper() {
        require(isDeveloper[msg.sender], "Not a registered developer");
        _;
    }

    function registerDeveloper(string memory _name, string memory _expertise, uint256 _hourlyRate) external {
        require(!isDeveloper[msg.sender], "Already registered");
        require(_hourlyRate > 0, "Invalid hourly rate");

        Developer storage dev = developers[msg.sender];
        dev.name = _name;
        dev.expertise = _expertise;
        dev.hourlyRate = _hourlyRate;
        dev.isActive = true;
        isDeveloper[msg.sender] = true;

        emit DeveloperRegistered(msg.sender, _name, _hourlyRate);
    }

    function bookCall(address _developer) external payable {
        require(isDeveloper[_developer], "Developer not registered");
        require(developers[_developer].isActive, "Developer not active");
        
        Developer storage dev = developers[_developer];
        uint256 callId = dev.totalCalls;
        
        // Assuming minimum 30-minute call duration for initial payment
        uint256 minimumPayment = (dev.hourlyRate * 30) / 60;
        require(msg.value >= minimumPayment, "Insufficient payment");

        dev.calls[callId] = Call({
            client: msg.sender,
            timestamp: block.timestamp,
            duration: 0,
            completed: false,
            paid: true
        });

        dev.totalCalls++;

        emit CallBooked(_developer, msg.sender, block.timestamp);
    }

    function completeCall(uint256 _callId, uint256 _duration) external onlyDeveloper {
        Call storage call = developers[msg.sender].calls[_callId];
        require(!call.completed, "Call already completed");
        require(call.paid, "Call not paid");

        call.completed = true;
        call.duration = _duration;

        emit CallCompleted(msg.sender, call.client, _duration);
    }

    function updateHourlyRate(uint256 _newRate) external onlyDeveloper {
        require(_newRate > 0, "Invalid hourly rate");
        developers[msg.sender].hourlyRate = _newRate;
    }

    function toggleAvailability() external onlyDeveloper {
        developers[msg.sender].isActive = !developers[msg.sender].isActive;
    }

    function getDeveloperDetails(address _developer) external view returns (
        string memory name,
        string memory expertise,
        uint256 hourlyRate,
        bool isActive,
        uint256 totalCalls
    ) {
        Developer storage dev = developers[_developer];
        return (dev.name, dev.expertise, dev.hourlyRate, dev.isActive, dev.totalCalls);
    }
} 