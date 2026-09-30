const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/pages/dashboard/RouteReplayPage.tsx',
  'frontend/src/pages/dashboard/VehiclesPage.tsx',
  'frontend/src/pages/dashboard/MediaDailyWorkPage.tsx',
  'frontend/src/pages/dashboard/ComplaintsPage.tsx'
];

files.forEach(file => {
  const filePath = path.join('c:/Users/Manish/OneDrive/Desktop/GOVERNMENT PROJECT', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace tracking with tracking-normal
  content = content.replace(/tracking-widest/g, 'tracking-normal');
  content = content.replace(/tracking-wider/g, 'tracking-normal');
  content = content.replace(/tracking-wide/g, 'tracking-normal');

  // Remove font-mono from uppercase headers (mostly adjacent to uppercase or tracking-normal)
  content = content.replace(/uppercase tracking-normal font-mono/g, 'uppercase tracking-normal');
  content = content.replace(/tracking-normal font-mono/g, 'tracking-normal');
  content = content.replace(/uppercase font-mono/g, 'uppercase');
  content = content.replace(/font-bold font-mono/g, 'font-bold');
  content = content.replace(/font-mono uppercase/g, 'uppercase');
  
  // also fix where font-mono is just in the class string of labels
  content = content.replace(/text-\[11px\] font-bold text-[#0a1628] uppercase tracking-normal font-mono/g, 'text-[11px] font-bold text-[#0a1628] uppercase tracking-normal');
  content = content.replace(/text-slate-500 uppercase tracking-normal font-mono/g, 'text-slate-500 uppercase tracking-normal');
  content = content.replace(/font-bold text-slate-600 uppercase tracking-normal font-mono/g, 'font-bold text-slate-600 uppercase tracking-normal');

  // General clean up if font-mono is left over with tracking-normal
  content = content.replace(/tracking-normal\s+font-mono/g, 'tracking-normal');
  content = content.replace(/font-mono\s+tracking-normal/g, 'tracking-normal');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
