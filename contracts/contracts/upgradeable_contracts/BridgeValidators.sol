pragma solidity 0.4.24;

import "./Ownable.sol";
import "../IBridgeValidators.sol";
import "../libraries/SafeMath.sol";
import "../upgradeability/EternalStorage.sol";


contract BridgeValidators is IBridgeValidators, EternalStorage, Ownable {
    using SafeMath for uint256;

    event ValidatorAdded (address indexed validator);
    event ValidatorRemoved (address indexed validator);
    event RequiredSignaturesChanged (uint256 requiredSignatures);

    function initialize(uint256 _requiredSignatures, address[] _initialValidators, address _owner)
      public returns(bool)
    {
        require(!isInitialized());
        require(_owner != address(0));
        setOwner(_owner);
        require(_requiredSignatures != 0);
        require(_initialValidators.length >= _requiredSignatures);
        for (uint256 i = 0; i < _initialValidators.length; i++) {
            require(_initialValidators[i] != address(0));
            assert(validators(_initialValidators[i]) != true);
            setValidatorCount(validatorCount().add(1));
            setValidator(_initialValidators[i], true);
            putValidatorToList(_initialValidators[i], i);
            emit ValidatorAdded(_initialValidators[i]);
        }
        uintStorage[keccak256(abi.encodePacked("requiredSignatures"))] = _requiredSignatures;
        uintStorage[keccak256("deployedAtBlock")] = block.number;
        setInitialize(true);
        emit RequiredSignaturesChanged(_requiredSignatures);
        return isInitialized();
    }

    function addValidator(address _validator) external onlyOwner {
        require(_validator != address(0));
        require(!isValidator(_validator));
        uint256 validatorsCount = validatorCount();
        putValidatorToList(_validator, validatorsCount);
        setValidator(_validator, true);
        setValidatorCount(validatorsCount.add(1));
        emit ValidatorAdded(_validator);
    }

    function removeValidator(address _validator) external onlyOwner {
        uint validatorsCount = validatorCount();
        require(validatorsCount > requiredSignatures());
        require(isValidator(_validator));
        for(uint256 i = 0; i < validatorsCount; i++) {
            address _nextValidator = addressStorage[keccak256(abi.encodePacked("validatorsList", i))];
            if (_nextValidator == _validator) {
                address lastValidator = addressStorage[keccak256(abi.encodePacked("validatorsList", validatorsCount.sub(1)))];
                putValidatorToList(lastValidator, i);
                delete addressStorage[keccak256(abi.encodePacked("validatorsList", validatorsCount.sub(1)))];
                break;
            }
        }
        setValidator(_validator, false);
        setValidatorCount(validatorsCount.sub(1));
        emit ValidatorRemoved(_validator);
    }

    function setRequiredSignatures(uint256 _requiredSignatures) external onlyOwner {
        require(validatorCount() >= _requiredSignatures);
        require(_requiredSignatures != 0);
        uintStorage[keccak256(abi.encodePacked("requiredSignatures"))] = _requiredSignatures;
        emit RequiredSignaturesChanged(_requiredSignatures);
    }

    function getBridgeValidatorsInterfacesVersion() public pure returns(uint64 major, uint64 minor, uint64 patch) {
        return (2, 0, 0);
    }

    function requiredSignatures() public view returns(uint256) {
        return uintStorage[keccak256(abi.encodePacked("requiredSignatures"))];
    }

    function validatorCount() public view returns(uint256) {
        return uintStorage[keccak256(abi.encodePacked("validatorCount"))];
    }

    function validators(address _validator) public view returns(bool) {
        return boolStorage[keccak256(abi.encodePacked("validators", _validator))];
    }

    function isValidator(address _validator) public view returns(bool) {
        return validators(_validator) == true;
    }

    function isInitialized() public view returns(bool) {
        return boolStorage[keccak256(abi.encodePacked("isInitialized"))];
    }

    function deployedAtBlock() public view returns(uint256) {
        return uintStorage[keccak256("deployedAtBlock")];
    }

    function validatorsList() public view returns(address[] _validators) {
        _validators = new address[](validatorCount());
        for(uint256 i = 0; i < _validators.length; i++) {
            _validators[i] = addressStorage[keccak256(abi.encodePacked("validatorsList", i))];
        }
    }

    function setValidatorCount(uint256 _validatorCount) private {
        uintStorage[keccak256(abi.encodePacked("validatorCount"))] = _validatorCount;
    }

    function setValidator(address _validator, bool _status) private {
        boolStorage[keccak256(abi.encodePacked("validators", _validator))] = _status;
    }

    function setInitialize(bool _status) private {
        boolStorage[keccak256(abi.encodePacked("isInitialized"))] = _status;
    }

    function putValidatorToList(address _validator, uint256 _index) private {
        addressStorage[keccak256(abi.encodePacked("validatorsList", _index))] = _validator;
    }
}
