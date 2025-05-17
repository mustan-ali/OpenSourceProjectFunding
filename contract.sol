// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OpenSourceProjectFunding {
    struct Project {
        uint256 projectNumber;
        address payable owner;
        string name;
        string description;
        string url;
        uint256 fundingGoal;
        uint256 totalFunds;
        bool isCompleted;
        uint256 deadline;
        bool isExpired;
        bool isWithdrawn;
    }

    uint256 projectCount;
    address payable contractOwner;
    uint256 public creationFee;
    uint256 public contributionFee;
    uint256 public earlyWithdrawalFee;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(address => uint256)) public contributions;

    constructor(uint256 _creationFee, uint256 _contributionFee, uint256 _earlyWithdrawalFee) {
        require(_creationFee > 0, "Creation fee must be greater than zero");
        require(_contributionFee > 0, "Contribution fee must be greater than zero");
        require(_earlyWithdrawalFee > 0, "Early withdrawal fee must be greater than zero");

        contractOwner = payable(msg.sender);
        creationFee = _creationFee;
        contributionFee = _contributionFee;
        earlyWithdrawalFee = _earlyWithdrawalFee;
    }

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only the contract owner can call this");
        _;
    }

    function setCreationFee(uint256 _creationFee) public onlyOwner {
        creationFee = _creationFee;
    }

    function setContributionFee(uint256 _contributionFee) public onlyOwner {
        contributionFee = _contributionFee;
    }

    function setEarlyWithdrawalFee(uint256 _earlyWithdrawalFee) public onlyOwner {
        earlyWithdrawalFee = _earlyWithdrawalFee;
    }

    event ProjectCreated(uint256 indexed projectId, address indexed owner, string name, uint256 fundingGoal, string url);
    event ProjectContributed(uint256 indexed projectId, address indexed contributor, uint256 amount);
    event ProjectWithdrawn(uint256 indexed projectId);
    event ProjectExpired(uint256 indexed projectId);
    event ProjectCompleted(uint256 indexed projectId);

    function createProject( string memory _name, string memory _description, string memory _url, uint256 _fundingGoal, uint256 _deadline) public payable {

        require(_fundingGoal > 0, "Funding goal must be greater than zero");
        require(_deadline > 0, "Deadline must be greater than zero");
        require(msg.value == creationFee, "Insufficient fee to create project");
        require(bytes(_name).length > 0, "Project name cannot be empty");
        require(bytes(_description).length > 0, "Project description cannot be empty");
        require(bytes(_url).length > 0, "Project URL cannot be empty");


        contractOwner.transfer(msg.value);

        projects[projectCount] = Project({
            projectNumber: projectCount,
            owner: payable(msg.sender),
            name: _name,
            description: _description,
            url: _url,
            fundingGoal: _fundingGoal,
            totalFunds: 0,
            isCompleted: false,
            deadline: block.timestamp + _deadline,
            isExpired : false,
            isWithdrawn: false
        });

        emit ProjectCreated(projectCount, msg.sender, _name, _fundingGoal, _url);
        projectCount++;
        updateProjectStatus();
    }

    function getProjectCount() public view returns (uint256) {
        return projectCount;
    }

    function updateProjectStatus() public {
        for (uint256 i = 0; i < projectCount; i++) {
            if (projects[i].isExpired == false && block.timestamp >= projects[i].deadline && projects[i].isCompleted == false) {
                projects[i].isExpired = true;
            }
        }
    }

    function contribute(uint256 _projectId) public payable {
        require(_projectId < projectCount, "Invalid project ID");

        updateProjectStatus();
        Project storage project = projects[_projectId];

        require(msg.sender != project.owner, "You can't contribute to your own projects");
        require(!project.isExpired, "Project has expired");
        require(!project.isCompleted, "Project has already been completed");
        require(!project.isWithdrawn, "Project has already been withdrawn");
        require(msg.value > 0, "Contribution must be greater than zero");

    
        uint256 feeAmount = (msg.value * contributionFee) / 100;
        require(msg.value > feeAmount, "Contribution amount must be greater than fee");

        contractOwner.transfer(feeAmount); 
        project.owner.transfer(msg.value - feeAmount);

        project.totalFunds += msg.value - feeAmount;
        contributions[_projectId][msg.sender] += (msg.value - feeAmount);

        if (project.totalFunds >= project.fundingGoal) {
            project.isCompleted = true;
            emit ProjectCompleted(_projectId);
        }

        emit ProjectContributed(_projectId, msg.sender, msg.value - feeAmount);

    }

    function getEarlyWithdrawalFee(uint256 _projectId) public view returns (uint256) {

        require(_projectId < projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        
        require(msg.sender == project.owner, "Only the project owner can check early withdrawal fee");
        require(!project.isExpired, "Project has expired");
        require(!project.isCompleted, "Project has already been completed");
        require(!project.isWithdrawn, "Project has already been withdrawn");
     
        return (project.totalFunds * earlyWithdrawalFee) / 100;
    }


    function withdrawEarly(uint256 _projectId) public payable {
        require(_projectId < projectCount, "Invalid project ID");
        updateProjectStatus();

        Project storage project = projects[_projectId];

        require(msg.sender == project.owner, "Only the project owner can withdraw early");
        require(!project.isExpired, "Project has expired");
        require(!project.isCompleted, "Project has already been completed");
        require(!project.isWithdrawn, "Project has already been withdrawn");

        uint256 feeAmount = (project.totalFunds * earlyWithdrawalFee) / 100;

        require(msg.value == feeAmount, "Insufficient fee to withdraw early");

        contractOwner.transfer(feeAmount);
        project.isWithdrawn = true;

        emit ProjectWithdrawn(_projectId);
    }
}