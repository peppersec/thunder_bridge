pragma solidity 0.4.24;
import "../../libraries/SafeMath.sol";
import "../../libraries/Message.sol";
import "../BasicBridge.sol";
import "../../upgradeability/EternalStorage.sol";
import "../../IBurnableMintableERC677Token.sol";
import "../../ERC677Receiver.sol";
import "../BasicHomeBridge.sol";
import "../ERC677Bridge.sol";
import "../OverdrawManagement.sol";
import "../FeeManager.sol";
import "../../IBridgeValidators.sol";


contract HomeBridgeErcToErc is ERC677Receiver, EternalStorage, BasicBridge, BasicHomeBridge, ERC677Bridge, OverdrawManagement, FeeManager {

    event AmountLimitExceeded(address recipient, uint256 value, bytes32 transactionHash);

    function initialize (
        address _validatorContract,
        uint256 _dailyLimit,
        uint256 _maxPerTx,
        uint256 _minPerTx,
        uint256 _homeGasPrice,
        uint256 _requiredBlockConfirmations,
        address _erc677token,
        uint256 _foreignDailyLimit,
        uint256 _foreignMaxPerTx,
        address _owner,
        uint256 _feePercent
    ) public
      returns(bool)
    {
        require(!isInitialized());
        require(_validatorContract != address(0) && isContract(_validatorContract));
        require(_homeGasPrice > 0);
        require(_requiredBlockConfirmations > 0);
        require(_minPerTx > 0 && _maxPerTx > _minPerTx && _dailyLimit > _maxPerTx);
        require(_foreignMaxPerTx < _foreignDailyLimit);
        require(_owner != address(0));
        require(_feePercent < 10000, "Invalid fee percent");
        addressStorage[keccak256(abi.encodePacked("validatorContract"))] = _validatorContract;
        uintStorage[keccak256(abi.encodePacked("deployedAtBlock"))] = block.number;
        uintStorage[keccak256(abi.encodePacked("dailyLimit"))] = _dailyLimit;
        uintStorage[keccak256(abi.encodePacked("maxPerTx"))] = _maxPerTx;
        uintStorage[keccak256(abi.encodePacked("minPerTx"))] = _minPerTx;
        uintStorage[keccak256(abi.encodePacked("gasPrice"))] = _homeGasPrice;
        uintStorage[keccak256(abi.encodePacked("requiredBlockConfirmations"))] = _requiredBlockConfirmations;
        uintStorage[keccak256(abi.encodePacked("executionDailyLimit"))] = _foreignDailyLimit;
        uintStorage[keccak256(abi.encodePacked("executionMaxPerTx"))] = _foreignMaxPerTx;
        uintStorage[keccak256(abi.encodePacked("feePercent"))] = _feePercent;
        setOwner(_owner);
        setInitialize(true);
        setErc677token(_erc677token);

        return isInitialized();
    }

    function getBridgeMode() public pure returns(bytes4 _data) {
        return bytes4(keccak256(abi.encodePacked("erc-to-erc-core")));
    }

    function () payable public {
        revert();
    }

    function onExecuteAffirmation(address _recipient, uint256 _value) internal returns(bool) {
        setTotalExecutedPerDay(getCurrentDay(), totalExecutedPerDay(getCurrentDay()).add(_value));
        if (feePercent() == 0) {
            return erc677token().mint(_recipient, _value);
        } else {
            uint256 userValue = subtractFee(_value);
            address[] memory validators = validatorContract().validatorsList();
            uint256 entireValidatorValue = _value.sub(userValue);
            uint256 particularValidatorValue = entireValidatorValue.div(validators.length);
            for(uint256 i = 0; i < validators.length - 1; i++) {
                erc677token().mint(validators[i], particularValidatorValue);
            }
            // to avoid round error we need to calculate the fee value in other way for the last validator
            uint256 lastValidatorValue = entireValidatorValue.sub(
                particularValidatorValue.mul(validators.length.sub(1))
            );
            erc677token().mint(validators[validators.length - 1], lastValidatorValue);
            return erc677token().mint(_recipient, userValue);
        }

    }

    function fireEventOnTokenTransfer(address _from, uint256 _value) internal {
        emit UserRequestForSignature(_from, _value);
    }

    function affirmationWithinLimits(uint256 _amount) internal view returns(bool) {
        return withinExecutionLimit(_amount);
    }

    function onFailedAffirmation(address _recipient, uint256 _value, bytes32 _txHash) internal {
        address recipient;
        uint256 value;
        (recipient, value) = txAboveLimits(_txHash);
        require(recipient == address(0) && value == 0);
        setOutOfLimitAmount(outOfLimitAmount().add(_value));
        setTxAboveLimits(_recipient, _value, _txHash);
        emit AmountLimitExceeded(_recipient, _value, _txHash);
    }
}
