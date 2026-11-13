const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminMenuPage.tsx', 'utf8');

const lucideImport = `import {
  CalendarDays,
  Plus,
  Utensils,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Search,
  Loader2,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  Copy,
  ChefHat,
  RotateCcw,
  X,
  Camera,
  Trash,
  AlertTriangle,
  FolderPlus
} from 'lucide-react'\n`;

code = code.replace("import React, { useState, useEffect, useMemo, useRef } from 'react'", "import React, { useState, useEffect, useMemo, useRef } from 'react'\n" + lucideImport);

code = code.replace(/<span className="material-symbols-outlined text-sm text-secondary">[\s\S]*?calendar_month[\s\S]*?<\/span>/, '<CalendarDays className="w-3.5 h-3.5 text-secondary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-base">add</span>', '<Plus className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-lg">restaurant_menu</span>', '<Utensils className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[13px]">expand_less</span>', '<ChevronUp className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[13px]">expand_more</span>', '<ChevronDown className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-sm">edit</span>', '<Edit2 className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-sm">delete</span>', '<Trash2 className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-base">add</span>', '<Plus className="w-4 h-4" />');

code = code.replace(/<span className="material-symbols-outlined absolute left-3\.5 top-1\/2 -translate-y-1\/2 text-outline text-\[18px\]">[\s\S]*?search[\s\S]*?<\/span>/, '<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />');
code = code.replace(/<span className="material-symbols-outlined animate-spin text-3xl text-primary">[\s\S]*?progress_activity[\s\S]*?<\/span>/, '<Loader2 className="w-8 h-8 animate-spin text-primary" />');

code = code.replace('<span className="material-symbols-outlined text-lg">edit</span>', '<Edit2 className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-lg">more_vert</span>', '<MoreVertical className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-sm">edit</span>', '<Edit2 className="w-3.5 h-3.5" />');

code = code.replace(/<span className="material-symbols-outlined text-sm">[\s\S]*?\{item\.available \? 'pause_circle' : 'play_circle'\}[\s\S]*?<\/span>/, "{item.available ? <PauseCircle className=\"w-3.5 h-3.5\" /> : <PlayCircle className=\"w-3.5 h-3.5\" />}");
code = code.replace('<span className="material-symbols-outlined text-sm">content_copy</span>', '<Copy className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-sm">delete</span>', '<Trash2 className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-4xl">soup_kitchen</span>', '<ChefHat className="w-10 h-10" />');
code = code.replace('<span className="material-symbols-outlined text-base">restart_alt</span>', '<RotateCcw className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-lg">add</span>', '<Plus className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-2xl">close</span>', '<X className="w-6 h-6" />');
code = code.replace('<span className="material-symbols-outlined text-sm">photo_camera</span>', '<Camera className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-2xl">delete_forever</span>', '<Trash className="w-6 h-6" />');
code = code.replace('<span className="material-symbols-outlined text-sm text-error">warning</span>', '<AlertTriangle className="w-3.5 h-3.5 text-error" />');
code = code.replace('<span className="material-symbols-outlined">library_add</span>', '<FolderPlus className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined">delete_sweep</span>', '<Trash2 className="w-4 h-4" />');

fs.writeFileSync('src/pages/admin/AdminMenuPage.tsx', code, 'utf8');
console.log('AdminMenuPage updated');

