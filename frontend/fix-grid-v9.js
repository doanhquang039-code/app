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
    
    // Replace Grid2 with Grid
    content = content.replace(/Grid2/g, 'Grid');
    
    // Convert xs={12} md={6} to size={{ xs: 12, md: 6 }}
    // Pattern: xs={number} md={number}
    content = content.replace(
      /<Grid\s+xs=\{(\d+)\}\s+md=\{(\d+)\}([^>]*?)>/g,
      '<Grid size={{ xs: $1, md: $2 }}$3>'
    );
    
    // Pattern: xs={number} sm={number} md={number}
    content = content.replace(
      /<Grid\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}([^>]*?)>/g,
      '<Grid size={{ xs: $1, sm: $2, md: $3 }}$4>'
    );
    
    // Pattern: xs={number} only
    content = content.replace(
      /<Grid\s+xs=\{(\d+)\}([^>]*?)>/g,
      '<Grid size={{ xs: $1 }}$2>'
    );
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  }
});

console.log('\n✓ All files converted to MUI v9 Grid API!');
