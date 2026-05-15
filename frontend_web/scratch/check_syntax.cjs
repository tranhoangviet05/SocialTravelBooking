const fs = require('fs');
const babel = require('@babel/core');

const code = fs.readFileSync(String.raw`d:\K23_23-27\Ki6\DoAnChuyenNganh1\SocialTravelBooking\frontend_web\src\pages\provider\MyServices.jsx`, 'utf-8');

try {
  babel.transformSync(code, {
    presets: ['@babel/preset-react'],
    filename: 'MyServices.jsx',
    ast: true
  });
  console.log("No syntax errors found!");
} catch (e) {
  console.log("Syntax Error:");
  console.log(e.message);
}
