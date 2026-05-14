const fs = require('fs');
const content = fs.readFileSync('app/landing/page.tsx', 'utf8');

const tags = [];
const regex = /<(\/?[a-zA-Z][a-zA-Z0-9]*)\b[^>]*(\/?)>/g;
const selfClosingTags = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'Image', 'BrandStar', 'Download', 'Facebook', 'Twitter', 'Instagram', 'MapPin', 'Truck', 'Smartphone', 'ListChecks', 'ShieldCheck', 'ChevronDown', 'Star', 'X', 'Menu', 'ArrowRight', 'ArrowLeft', 'Search', 'ShoppingBag', 'User', 'Heart', 'Bell', 'LogOut', 'Settings', 'Package', 'Store', 'CreditCard', 'ExternalLink', 'Plus', 'Minus', 'Check', 'AlertCircle', 'Clock', 'Globe', 'Zap', 'Mail', 'Phone', 'Play', 'Pause', 'SkipBack', 'SkipForward', 'Volume2', 'VolumeX', 'Maximize2', 'Minimize2', 'Trash2', 'Edit2', 'Copy', 'Share2', 'Save', 'DownloadCloud', 'UploadCloud', 'Cloud', 'Sun', 'Moon', 'Filter', 'SortAsc', 'SortDesc', 'Grid', 'List', 'MoreHorizontal', 'MoreVertical', 'Info', 'HelpCircle', 'MinusCircle', 'PlusCircle', 'CheckCircle', 'XCircle', 'Lock', 'Unlock', 'Eye', 'EyeOff', 'Key', 'Link2', 'Paperclip', 'Scissors', 'Hash', 'AtSign', 'Send', 'Archive', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft', 'ChevronUp', 'RotateCcw', 'RotateCw', 'RefreshCw', 'RefreshCcw', 'Repeat', 'Shuffle', 'Compass', 'Map', 'Terminal', 'Code', 'Database', 'Server', 'Cpu', 'Watch', 'Watch', 'Camera', 'Video', 'Mic', 'Headphones', 'Speaker', 'Monitor', 'Tv', 'Tablet', 'Pocket', 'Book', 'Bookmark', 'Tag', 'Clipboard', 'FileText', 'File', 'Folder', 'Inbox', 'Mail', 'Archive', 'Cloud', 'Download', 'Upload', 'Search', 'Filter', 'Settings', 'Bell', 'User', 'Users', 'UserPlus', 'UserMinus', 'UserCheck', 'UserX', 'Calendar', 'Clock', 'Activity', 'TrendingUp', 'TrendingDown', 'BarChart', 'PieChart', 'Layers', 'Grid', 'Layout', 'Columns', 'Sidebar', 'Minimize', 'Maximize', 'ZoomIn', 'ZoomOut', 'Crosshair', 'Target', 'LifeBuoy', 'Flag', 'Anchor', 'Tool', 'ShoppingCart', 'ShoppingBag', 'Briefcase', 'Umbrella', 'Gift', 'Coffee', 'Music', 'Heart', 'Star', 'ThumbsUp', 'ThumbsDown', 'Eye', 'EyeOff', 'Feather', 'Paperclip', 'AtSign', 'Link', 'Link2', 'ExternalLink', 'Share', 'Share2', 'LogOut', 'LogIn', 'Power', 'Cast', 'Airplay', 'Bluetooth', 'Wifi', 'Battery', 'BatteryCharging', 'Bluetooth', 'Wifi', 'Battery', 'BatteryCharging', 'Cast', 'Airplay', 'Power', 'LogIn', 'LogOut', 'Share2', 'Share', 'ExternalLink', 'Link2', 'Link', 'AtSign', 'Paperclip', 'Feather', 'EyeOff', 'Eye', 'ThumbsDown', 'ThumbsUp', 'Star', 'Heart', 'Music', 'Coffee', 'Gift', 'Umbrella', 'Briefcase', 'ShoppingBag', 'ShoppingCart', 'Tool', 'Anchor', 'Flag', 'LifeBuoy', 'Target', 'Crosshair', 'ZoomOut', 'ZoomIn', 'Maximize', 'Minimize', 'Sidebar', 'Columns', 'Layout', 'Grid', 'Layers', 'PieChart', 'BarChart', 'TrendingDown', 'TrendingUp', 'Activity', 'Clock', 'Calendar', 'UserX', 'UserCheck', 'UserMinus', 'UserPlus', 'Users', 'User', 'Bell', 'Settings', 'Filter', 'Search', 'Upload', 'Download', 'Archive', 'Mail', 'Inbox', 'Folder', 'File', 'FileText', 'Clipboard', 'Tag', 'Bookmark', 'Book', 'Pocket', 'Tv', 'Monitor', 'Speaker', 'Headphones', 'Mic', 'Video', 'Camera', 'Watch', 'Cpu', 'Server', 'Database', 'Code', 'Terminal', 'Map', 'Compass', 'Repeat', 'RefreshCcw', 'RefreshCw', 'RotateCw', 'RotateCcw', 'ChevronLeft', 'ChevronRight', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);

let match;
while ((match = regex.exec(content)) !== null) {
  const [full, name, selfClosing] = match;
  if (selfClosing === '/' || selfClosingTags.has(name)) continue;
  if (name.startsWith('/')) {
    const tagName = name.substring(1);
    if (tags.length === 0) {
      console.log(`Error: Unexpected closing tag </${tagName}> at line ${content.substring(0, match.index).split('\n').length}`);
    } else {
      const lastTag = tags.pop();
      if (lastTag.name !== tagName) {
        console.log(`Error: Mismatched tags <${lastTag.name}> (line ${lastTag.line}) and </${tagName}> (line ${content.substring(0, match.index).split('\n').length})`);
      }
    }
  } else {
    const line = content.substring(0, match.index).split('\n').length;
    tags.push({ name, line });
  }
}

if (tags.length > 0) {
  console.log('Unclosed tags:');
  tags.forEach(t => console.log(`  <${t.name}> on line ${t.line}`));
} else {
  console.log('All tags are balanced!');
}
