// Utility to convert height in inches to feet/inches string (e.g., 79 => "6'7\"")
function inchesToFeetInches(inches) {
  if (!inches || isNaN(inches)) return '';
  const feet = Math.floor(inches / 12);
  const remainder = inches % 12;
  return `${feet}'${remainder}"`;
}

module.exports = { inchesToFeetInches }; 