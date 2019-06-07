pragma solidity 0.4.24;

import "../upgradeability/EternalStorage.sol";
import "../libraries/SafeMath.sol";
import "./OwnedUpgradeability.sol";
import "./Ownable.sol";


contract FeeManager is EternalStorage, Ownable {
    using SafeMath for uint256;

    event FeePercentChanged(uint newFeePercent);

    /**
    * @dev Sets current fee percent. It has 2 decimal places.
    * e.g. value 1337 has to be interpreted as 13.37%
    * @param _feePercent Fee percent.
    */
    function setFeePercent(uint256 _feePercent) public onlyOwner {
        require(_feePercent < 10000, "Invalid fee percent");
        uintStorage[keccak256(abi.encodePacked("feePercent"))] = _feePercent;
        emit FeePercentChanged(_feePercent);
    }

    /**
    * @dev Returns current fee percent. It has 2 decimal places.
    * e.g. value 1337 has to be interpreted as 13.37%
    * @return fee percent.
    */
    function feePercent() public view returns(uint256) {
        return uintStorage[keccak256(abi.encodePacked("feePercent"))];
    }

    function subtractFee(uint _value) public view returns(uint256) {
        uint256 fullPercent = 10000;
        return _value.sub(_value.mul(feePercent()).div(fullPercent));
    }
}
