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

    // Array to keep track of all developer addresses
    address[] public developerAddresses;
    
    // Mapping of address to Developer struct
    mapping(address => Developer) public developers;

    // Events
    event DeveloperRegistered(address indexed developer, string name, string expertise, uint256 hourlyRate);
    event CallBooked(address indexed developer, address indexed client, uint256 amount);
    event CallCompleted(uint256 callId, uint256 duration);
    event AvailabilityToggled(address indexed developer, bool isAvailable);

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
        
        emit CallBooked(_developer, msg.sender, msg.value);
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
} 