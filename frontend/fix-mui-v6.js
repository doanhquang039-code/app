const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'src/components/Analytics/AnalyticsDashboard.tsx',
  'src/components/Budget/BudgetManager.tsx',
  'src/components/Dashboard/AdvancedDashboard.tsx',
  'src/components/Notifications/NotificationCenter.tsx',
  'src/components/Settings/SettingsPanel.tsx',
  'src/components/transactions/TransactionForm.tsx',
];

function fixMuiV6(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix 1: Replace Grid import with Grid2
  content = content.replace(
    /import\s*{([^}]*)\bGrid\b([^}]*)}\s*from\s*['"]@mui\/material['"]/g,
    (match, before, after) => {
      const imports = (before + after).split(',').map(i => i.trim()).filter(i => i && i !== 'Grid');
      return `import {\n  ${imports.join(',\n  ')}\n} from '@mui/material';\nimport Grid from '@mui/material/Unstable_Grid2';`;
    }
  );
  
  // Fix 2: Replace fontWeight prop with sx
  content = content.replace(
    /<Typography\s+([^>]*?)fontWeight=["']([^"']+)["']([^>]*?)>/g,
    (match, before, weight, after) => {
      // Check if sx already exists
      if (before.includes('sx=') || after.includes('sx=')) {
        // Merge with existing sx
        const sxMatch = (before + after).match(/sx=\{\{([^}]+)\}\}/);
        if (sxMatch) {
          const existingSx = sxMatch[1];
          const newSx = `sx={{ ${existingSx}, fontWeight: '${weight}' }}`;
          return `<Typography ${before}${after}>`.replace(/sx=\{\{[^}]+\}\}/, newSx);
        }
      }
      return `<Typography ${before}sx={{ fontWeight: '${weight}' }}${after}>`;
    }
  );
  
  // Fix 3: Remove item prop from Grid (Grid2 doesn't need it)
  content = content.replace(/<Grid\s+item\s+/g, '<Grid ');
  
  // Fix 4: Fix InputProps to slotProps
  content = content.replace(
    /InputProps=\{\{([^}]+)\}\}/g,
    'slotProps={{ input: {$1} }}'
  );
  
  // Fix 5: Fix renderTags to renderOption for Autocomplete
  content = content.replace(
    /renderTags=\{([^}]+)\}/g,
    '// renderTags removed in MUI v6 - use renderOption instead'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${filePath}`);
}

// Run fixes
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    try {
      fixMuiV6(fullPath);
    } catch (error) {
      console.error(`✗ Error fixing ${file}:`, error.message);
    }
  } else {
    console.warn(`⚠ File not found: ${file}`);
  }
});

console.log('\n✓ All files processed!');
console.log('Note: Some manual fixes may still be needed. Run `npm run build` to check.');
