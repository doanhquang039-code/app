const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/Analytics/AnalyticsDashboard.tsx',
  'src/components/Budget/BudgetManager.tsx',
  'src/components/Dashboard/AdvancedDashboard.tsx',
  'src/components/Settings/SettingsPanel.tsx',
  'src/components/transactions/TransactionForm.tsx',
];

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace all Grid with Grid2
    content = content.replace(/<Grid\s/g, '<Grid2 ');
    content = content.replace(/<\/Grid>/g, '</Grid2>');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  }
});

console.log('\n✓ All Grid components replaced with Grid2!');
