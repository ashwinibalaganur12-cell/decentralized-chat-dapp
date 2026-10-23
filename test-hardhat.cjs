try {
    console.log("Attempting to require hardhat...");
    require("hardhat");
    console.log("✅ Hardhat required successfully");

    console.log("Attempting to require @nomicfoundation/hardhat-toolbox...");
    require("@nomicfoundation/hardhat-toolbox");
    console.log("✅ Toolbox required successfully");

} catch (e) {
    console.error("❌ Error:", e.message);
    console.error("Stack:", e.stack);
}
