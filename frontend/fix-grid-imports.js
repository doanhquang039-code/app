const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/Analytics/AnalyticsDashboard.tsx',
  'src/components/Budget/BudgetManager.tsx',
  'src/components/Dashboard/AdvancedDashboard.tsx',
  'src/components/Settings/SettingsPanel.tsx',
];

filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove the Grid2 import line
    content = content.replace(/import Grid2 from '@mui\/material\/Grid2';?\n?/g, '');
    
    // Add Grid to the main @mui/material import if not already there
    content = content.replace(
      /(} from '@mui\/material';)/,
      (match, p1) => {
        // Check if Grid is already in the import
        const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*'@mui\/material'/);
        if (importMatch && !importMatch[1].includes('Grid')) {
          return `,\n  Grid,\n${p1}`;
        }
        return match;
      }
    );
    
    // Replace Grid2 with Grid in JSX
    content = content.replace(/<Grid2\s/g, '<Grid ');
    content = content.replace(/<\/Grid2>/g, '</Grid>');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  }
});

console.log('\n✓ All Grid imports fixed!');
