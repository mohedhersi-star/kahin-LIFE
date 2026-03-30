import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('./src').filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Backgrounds & Borders
  content = content.replace(/dark:bg-gray-900/g, 'dark:bg-black');
  content = content.replace(/dark:bg-gray-800/g, 'dark:bg-zinc-900');
  content = content.replace(/dark:bg-gray-700/g, 'dark:bg-zinc-800');
  content = content.replace(/dark:border-gray-800/g, 'dark:border-zinc-800');
  content = content.replace(/dark:border-gray-700/g, 'dark:border-zinc-800');
  content = content.replace(/dark:border-gray-600/g, 'dark:border-zinc-700');
  
  // Primary Buttons
  content = content.replace(/bg-blue-600 text-white/g, 'bg-yellow-400 text-black font-medium');
  content = content.replace(/hover:bg-blue-700/g, 'hover:bg-yellow-500');
  
  // Text Colors
  content = content.replace(/text-blue-600/g, 'text-yellow-500');
  content = content.replace(/text-blue-500/g, 'text-yellow-500');
  content = content.replace(/text-blue-400/g, 'text-yellow-400');
  content = content.replace(/text-green-600/g, 'text-yellow-500');
  content = content.replace(/text-green-500/g, 'text-yellow-500');
  
  // Background Accents
  content = content.replace(/bg-green-600/g, 'bg-yellow-400');
  content = content.replace(/bg-green-500/g, 'bg-yellow-400');
  content = content.replace(/bg-blue-500/g, 'bg-yellow-400');
  content = content.replace(/bg-blue-50/g, 'bg-yellow-50');
  content = content.replace(/bg-green-50/g, 'bg-yellow-50');
  
  // Dark Accents
  content = content.replace(/dark:bg-blue-900\/20/g, 'dark:bg-yellow-900/20');
  content = content.replace(/dark:bg-green-900\/20/g, 'dark:bg-yellow-900/20');
  
  // Chart
  content = content.replace(/fill="#3b82f6"/g, 'fill="#eab308"');

  // Focus rings
  content = content.replace(/focus:ring-blue-500/g, 'focus:ring-yellow-400');

  fs.writeFileSync(file, content, 'utf8');
});
