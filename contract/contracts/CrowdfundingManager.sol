// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Implement when non-native token support included.

contract CrowdfundingManager {

    event ProjectAdded(uint256 indexed projectId, address indexed projectWallet);
    event ProjectDeleted(uint256 indexed projectId);
    event TokensFunded_Crowdfunding(address indexed donorWallet, uint256 indexed projectId, uint256 depositedAmount);
    event WithdrawalRequested(uint256 indexed projectId, address indexed projectWallet);
    event WithdrawalApproved(uint256 indexed projectId, address indexed projectWallet);
    event TokensWithdrawn(uint256 indexed projectId, address indexed projectWallet, uint withdrawnAmount);
    
    event merchantAdded(uint256 indexed merchantId, address indexed merchantWallet);
    event InvestmentMade(uint256 indexed projectId, address indexed investor, uint256 investmentAmount, uint256 profitShare);
    event ProfitDistributed(uint256 indexed projectId, uint256 profitAmount, uint256 merchantProfit, uint256 investorProfit, uint256 platformProfit);
    event MerchantReputationUpdated(address indexed merchant, uint256 reputationPoints);
    event MerchantDeleted(address indexed merchantWallet);

    struct RaiseProjects {
        uint256 projectId;
        address projectWallet;
        uint256 goalAmount;
        uint256 deadline;
        uint256 amountRaised;
        bool withdrawalPermitted;
        bool withdrawalRequested;
        uint256 profitSharingRatio; // Percentage of profit share for merchant
        uint256 merchantDeposit; // Amount deposited by merchant as collateral 
        bool investmentRoundActive; 
        bool profitDistributionDone;
        bytes32 projectHash; //Hash to verify project integrity
    }

    struct Merchant {
        uint256 merchantId;
        address merchantWallet;
        uint256 reputationPoints;
        uint256 successfulProjects;
        uint256 failedProjects;
        uint256 totalInvestments;
        bool isActive;
    }

    struct Investment {
        uint256 investmentId;
        address investor;
        uint256 amount;
        bool refunded;
        uint256 projectId;
    }

    mapping(uint256 => RaiseProjects) public projects;
    mapping(address => Merchant) public merchants;
    mapping(uint256 => Investment[]) public projectInvestments;
    address[] public merchantAddresses;
    uint256 public projectCounter = 1;
    uint256 public merchantCounter = 1;
    uint256 public investmentCounter = 1;
    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier projectExists(uint256 projectId) {
        require(
            projectId < projectCounter &&
            projects[projectId].projectId != 0 &&
            projects[projectId].projectWallet != address(0),
            "Project does not exist");
        _;
    }

    modifier onlyMerchantExists(address merchantWallet) {
        require(
            merchants[merchantWallet].merchantId != 0 &&
            merchants[merchantWallet].merchantWallet != address(0),
            "Merchant does not exist");
        _;
    }

    modifier onlyMerchant() {
        require(merchants[msg.sender].merchantWallet == msg.sender, "Only a registered merchant can perform this action");
        _;
    }

    constructor() {
        admin = address(0x5B38Da6a701c568545dCfcB03FcB875f56beddC4);
        merchantAddresses.push(address(0));

        // Initialize the null investment
        projectInvestments[0].push(Investment({
            investmentId: 0,
            investor: address(0),
            amount: 0,
            refunded: false,
            projectId: 0
        }));

    }

    function addMerchant() public {
        require(!merchants[msg.sender].isActive, "Merchant already registered");
        merchants[msg.sender] = Merchant({
            merchantId: merchantCounter,
            merchantWallet: msg.sender,
            reputationPoints: 1,
            successfulProjects: 0,
            failedProjects: 0,
            totalInvestments: 0,
            isActive: true
        });

        merchantAddresses.push(msg.sender);
        emit merchantAdded(merchantCounter, msg.sender);
        merchantCounter++;
    }

    function deleteMerchant(address merchantWallet) public onlyAdmin onlyMerchantExists(merchantWallet) {
        delete merchants[merchantWallet];
        emit MerchantDeleted(merchantWallet);
    }


    function isMerchantRegistered(address merchantWallet) public view returns (bool) {
    return merchants[merchantWallet].isActive;
    }

    function getMerchant(address merchantWallet)
        external
        view
        onlyMerchantExists(merchantWallet)
        returns (uint256, address, uint256, uint256, uint256, uint256, bool)
    {
        Merchant memory selectedMerchant = merchants[merchantWallet];
        return (
            selectedMerchant.merchantId,
            selectedMerchant.merchantWallet,
            selectedMerchant.reputationPoints,
            selectedMerchant.successfulProjects,
            selectedMerchant.failedProjects,
            selectedMerchant.totalInvestments,
            selectedMerchant.isActive
        );
    }

    function getAllMerchants()
        external
        view
        returns (uint256[] memory, address[] memory, uint256[] memory, uint256[] memory, uint256[] memory, uint256[] memory, bool[] memory)
    {
        uint256[] memory merchantIds = new uint256[](merchantCounter);
        address[] memory merchantWalletss = new address[](merchantCounter);
        uint256[] memory reputationPointss = new uint256[](merchantCounter);
        uint256[] memory successfulProjectss = new uint256[](merchantCounter);
        uint256[] memory failedProjectss = new uint256[](merchantCounter);
        uint256[] memory totalInvestmentss = new uint256[](merchantCounter);
        bool[] memory isActives = new bool[](merchantCounter);

        for (uint256 i = 0; i < merchantCounter; i++) {
            address merchantAddress = merchantAddresses[i];
            Merchant memory merchant = merchants[merchantAddress];
            merchantIds[i] = merchant.merchantId;
            merchantWalletss[i] = merchant.merchantWallet;
            reputationPointss[i] = merchant.reputationPoints;
            successfulProjectss[i] = merchant.successfulProjects;
            failedProjectss[i] = merchant.failedProjects;
            totalInvestmentss[i] = merchant.totalInvestments;
            isActives[i] = merchant.isActive;
        }
        return (merchantIds, merchantWalletss, reputationPointss, successfulProjectss, failedProjectss, totalInvestmentss, isActives);
    }

    function addProject(address projectWallet) public onlyMerchant {
        bytes32 hash = keccak256(abi.encodePacked(projectWallet, projectCounter));
        
        projects[projectCounter] = RaiseProjects({
            projectId: projectCounter,
            projectWallet: projectWallet,
            goalAmount: 0,
            deadline: 0,
            amountRaised: 0,
            withdrawalPermitted: false,
            withdrawalRequested: false,
            profitSharingRatio: 0,
            merchantDeposit: 0,
            investmentRoundActive: false,
            profitDistributionDone: false,
            projectHash: hash
        });

        emit ProjectAdded(projectCounter, projectWallet);
        projectCounter++;
    }

    function deleteProject(uint256 projectId) public projectExists(projectId) {
        require(projects[projectId].projectWallet == msg.sender, "Only the project creator can delete the project");
        delete projects[projectId];
        emit ProjectDeleted(projectId);
    }

    function getProject(uint256 projectId)
        external
        view
        projectExists(projectId)
        returns (uint256, address, uint256, uint256, uint256, uint256, uint256, bool, bool)
    {
        RaiseProjects memory selectedProject = projects[projectId];
        return (
            selectedProject.projectId,
            selectedProject.projectWallet,
            selectedProject.goalAmount,
            selectedProject.amountRaised,
            selectedProject.deadline,
            selectedProject.profitSharingRatio,
            selectedProject.merchantDeposit,
            selectedProject.investmentRoundActive,
            selectedProject.profitDistributionDone
        );
    }

    function getAllProjects()
        external
        view
        returns (uint256[] memory, address[] memory)
    {
        uint256[] memory projectIds = new uint256[](projectCounter);
        address[] memory projectWallets = new address[](projectCounter);

        for (uint256 i = 0; i < projectCounter; i++) {
            RaiseProjects memory project = projects[i];
            projectIds[i] = project.projectId;
            projectWallets[i] = project.projectWallet;
        }
        return (projectIds, projectWallets);
    }

    function getAllInvestmentRoundDetails()
        external
        view
        returns (uint256[] memory, uint256[] memory, uint256[] memory, uint256[] memory, uint256[] memory, bool[] memory, bool[] memory)
    {
        uint256[] memory goalAmounts = new uint256[](projectCounter);
        uint256[] memory deadlines = new uint256[](projectCounter);
        uint256[] memory amountsRaised = new uint256[](projectCounter);
        uint256[] memory profitSharingRatios = new uint256[](projectCounter);
        uint256[] memory merchantDeposits = new uint256[](projectCounter);
        bool[] memory investmentRoundsActive = new bool[](projectCounter);
        bool[] memory profitDistributionsDone = new bool[](projectCounter);

        for (uint256 i = 0; i < projectCounter; i++) {
            RaiseProjects memory project = projects[i];
            goalAmounts[i] = project.goalAmount;
            deadlines[i] = project.deadline;
            amountsRaised[i] = project.amountRaised;
            profitSharingRatios[i] = project.profitSharingRatio;
            merchantDeposits[i] = project.merchantDeposit;
            investmentRoundsActive[i] = project.investmentRoundActive;
            profitDistributionsDone[i] = project.profitDistributionDone;
        }
        return (goalAmounts, deadlines, amountsRaised, profitSharingRatios, merchantDeposits, investmentRoundsActive, profitDistributionsDone);
    }

    function startInvestmentRound(uint256 projectId, uint256 goalAmount, uint256 deadline, uint256 profitSharingRatio) public payable onlyMerchant projectExists(projectId) {
        RaiseProjects storage project = projects[projectId];
        require(msg.sender == projects[projectId].projectWallet, "Only the project owner can start the investment round");
        require(!project.investmentRoundActive, "Investment round already active");
        require(msg.value > 0, "Collateral must be greater than zero");
        require(goalAmount > 0, "Requested investment must be greater than zero");
        require(deadline > 0, "Deadline must be greater than zero");
        require(profitSharingRatio > 0 && profitSharingRatio < 95, "Merchant profit share must be in range 0%-95%");

        projects[projectId].merchantDeposit = msg.value;
        projects[projectId].goalAmount = goalAmount;
        projects[projectId].deadline = deadline;
        projects[projectId].profitSharingRatio = profitSharingRatio;
        projects[projectId].investmentRoundActive = true;
        

    }

    function endInvestmentRound(uint256 projectId) public onlyMerchant projectExists(projectId) {
        RaiseProjects storage project = projects[projectId];
        require(project.investmentRoundActive, "Investment round is not active");
        require(msg.sender == project.projectWallet, "Only the project owner can end the investment round");

        if (project.amountRaised < project.goalAmount) {
            // Investor compensation if the goal amount is not met.
            
            if (projectInvestments[projectId].length == 0) {
                project.investmentRoundActive = false;
            }
            else{ 
                for (uint256 i = 0; i < projectInvestments[projectId].length; i++) {
                    Investment storage inv = projectInvestments[projectId][i];
                    if (!inv.refunded) {
                        (bool success,) = inv.investor.call{value: inv.amount}("");
                        require(success, "ETH transfer failed to investor");
                        inv.refunded = true;
                    }
                }
            }

            project.investmentRoundActive = false;

            //merchants[project.projectWallet].failedProjects += 1;
            // Example: Decrease reputation can be dynamic
            if (merchants[project.projectWallet].reputationPoints >= 5) {
                merchants[project.projectWallet].reputationPoints -= 5;
            } else {
                merchants[project.projectWallet].reputationPoints = 0;
            }

        } else {
            // Close the investment round as successful
            project.investmentRoundActive = false;
            // Amount raised in the investment round to be sent to the merchant.
            (bool successProjectInvestment,) = project.projectWallet.call{value: project.amountRaised}("");
            require(successProjectInvestment, "Project investment failed to send to merchant");
        }
    }


    function depositFunds_Crowdfunding(uint256 projectId) public payable projectExists(projectId) {
        RaiseProjects storage project = projects[projectId];
        require(project.investmentRoundActive, "Investment round not active");

        uint256 depositedAmount = msg.value;
        require(depositedAmount > 0, "Enter an ETH value to fund");

        uint256 FEE = (depositedAmount * 10) / 100;
        depositedAmount = depositedAmount - FEE;
        
        projectInvestments[projectId].push(Investment({
            investmentId: investmentCounter,
            investor: msg.sender,
            amount: depositedAmount,
            refunded: false,
            projectId: projectId
        }));
        investmentCounter = investmentCounter + 1;

        project.amountRaised += depositedAmount;
        emit TokensFunded_Crowdfunding(msg.sender, projectId, depositedAmount);
    }

function getAllInvestments() 
    external 
    view 
    returns (
        uint256[] memory, 
        address[] memory, 
        uint256[] memory, 
        bool[] memory,
        uint256[] memory
    ) 
{
    // Initialize arrays based on the total number of investments
    uint256[] memory investmentIds = new uint256[](investmentCounter);
    address[] memory investors = new address[](investmentCounter);
    uint256[] memory amounts = new uint256[](investmentCounter);
    bool[] memory refundStatuses = new bool[](investmentCounter);
    uint256[] memory projectIds = new uint256[](investmentCounter);

    uint256 index = 0;

    // Loop through all projects and collect investments
    for (uint256 i = 0; i < projectCounter; i++) {
        Investment[] storage investments = projectInvestments[i]; // Using storage to avoid copying
        for (uint256 j = 0; j < investments.length; j++) {
            investmentIds[index] = investments[j].investmentId;
            investors[index] = investments[j].investor;
            amounts[index] = investments[j].amount;
            refundStatuses[index] = investments[j].refunded;
            projectIds[index] = investments[j].projectId;
            index++;
        }
    }

    return (investmentIds, investors, amounts, refundStatuses, projectIds);
}



    function getProjectsInvestedByInvestor(address investor) 
        external 
        view 
        returns (
            uint256[] memory, 
            address[] memory, 
            uint256[] memory, 
            bool[] memory, 
            uint256[] memory
        ) 
    {
        uint256[] memory projectIds = new uint256[](investmentCounter);
        uint256[] memory investmentIds = new uint256[](investmentCounter);
        uint256[] memory amounts = new uint256[](investmentCounter);
        bool[] memory refundStatuses = new bool[](investmentCounter);
        address[] memory investors = new address[](investmentCounter);

        uint256 index = 0;

        for (uint256 i = 0; i < projectCounter; i++) {
            for (uint256 j = 0; j < projectInvestments[i].length; j++) {
                if (projectInvestments[i][j].investor == investor) {
                    Investment memory inv = projectInvestments[i][j];
                    investmentIds[index] = inv.investmentId;
                    investors[index] = inv.investor;
                    amounts[index] = inv.amount;
                    refundStatuses[index] = inv.refunded;
                    projectIds[index] = inv.projectId;
                    index++;
                }
            }
        }

        return (investmentIds, investors, amounts, refundStatuses, projectIds);
    }


    function distributeProfits(uint256 projectId) public payable onlyMerchant projectExists(projectId) {
        RaiseProjects storage project = projects[projectId];
        require(project.merchantDeposit > 0, "No collateral from merchant stored for project");
        uint256 profitMade = msg.value;

        if (profitMade > 0) { // Add: If profitMade = 0 then neutral reputation change
            uint256 totalProfits = project.amountRaised;
            uint256 merchantShare = (totalProfits * project.profitSharingRatio) / 100;
            uint256 platformShare = (totalProfits * 5) / 100; // Example: 5% for platform
            uint256 investorShare = totalProfits - merchantShare - platformShare;

            // Distribute to investors
            for (uint256 i = 0; i < projectInvestments[projectId].length; i++) {
                Investment storage inv = projectInvestments[projectId][i];
                uint256 investorProfit = (investorShare * inv.amount) / project.amountRaised;
                (bool successInvestorShare,) = inv.investor.call{value: investorProfit}("");
                require(successInvestorShare, "ETH share transfer failed to investor");
            }

            // Send profit share to merchant
            (bool successMerchantShare,) = payable(project.projectWallet).call{value: merchantShare}("");
            require(successMerchantShare, "ETH share transfer failed to merchant");

            // Send profit share to platform
            (bool successPlatformShare,) = admin.call{value: platformShare}("");
            require(successPlatformShare, "ETH share transfer failed to platform");

            // Increase merchant reputation
            merchants[project.projectWallet].successfulProjects += 1;
            merchants[project.projectWallet].reputationPoints += 10; // Example: Increase reputation

            project.investmentRoundActive = false;
            project.profitDistributionDone = true;

        } else {
            // Refund investors and decrease merchant reputation
            for (uint256 i = 0; i < projectInvestments[projectId].length; i++) {
                Investment storage inv = projectInvestments[projectId][i];
                if (!inv.refunded) {
                    uint256 investorCompensation = (project.merchantDeposit * inv.amount) / project.amountRaised;
                    (bool successInvestorShare,) = inv.investor.call{value: investorCompensation}("");
                    require(successInvestorShare, "ETH compensation transfer failed to investor");
                    inv.refunded = true;
                }
            }

            merchants[project.projectWallet].failedProjects += 1;
            merchants[project.projectWallet].reputationPoints = merchants[project.projectWallet].reputationPoints > 0 ? merchants[project.projectWallet].reputationPoints - 5 : 0; // Example: Decrease reputation
        }

        project.investmentRoundActive = false;
    }

    function updateMerchantReputation(address merchantWallet, uint256 points) public onlyAdmin {
        Merchant storage merchant = merchants[merchantWallet];
        require(merchant.isActive, "Merchant not active");
        merchant.reputationPoints += points;
        emit MerchantReputationUpdated(merchantWallet, merchant.reputationPoints);
    }
}