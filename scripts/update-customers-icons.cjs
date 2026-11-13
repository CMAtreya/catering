const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCustomersPage.tsx', 'utf8');

const lucideImport = `import {
  Loader2,
  Download,
  Search,
  Phone,
  ArrowRight,
  ArrowLeft,
  MapPin,
  MessageSquare,
  FilePlus,
  Scroll,
  Calendar,
  HelpCircle,
  FileText,
  Leaf,
  MessageSquarePlus,
  Send,
  FileEdit,
  X,
  Save
} from 'lucide-react'\n`;

code = code.replace("import React, { useState, useEffect, useMemo, useRef } from 'react'", "import React, { useState, useEffect, useMemo, useRef } from 'react'\n" + lucideImport);

code = code.replace(/<span className="material-symbols-outlined animate-spin text-3xl text-primary">[\s\S]*?progress_activity[\s\S]*?<\/span>/, '<Loader2 className="w-8 h-8 animate-spin text-primary" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">download</span>', '<Download className="w-4 h-4 shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined absolute left-3\.5 top-1\/2 -translate-y-1\/2 text-outline text-\[20px\]">[\s\S]*?search[\s\S]*?<\/span>/, '<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />');

code = code.replace('<span className="material-symbols-outlined text-[15px]">call</span>', '<Phone className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">arrow_forward</span>', '<ArrowRight className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">call</span>', '<Phone className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">arrow_back</span>', '<ArrowLeft className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-outline">location_on</span>', '<MapPin className="w-4 h-4 text-outline shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[17px]">call</span>', '<Phone className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[17px]">chat</span>', '<MessageSquare className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[17px]">note_add</span>', '<FilePlus className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>', '<Scroll className="w-5 h-5 text-primary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-outline">event</span>', '<Calendar className="w-4 h-4 text-outline shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[14px]">arrow_forward</span>', '<ArrowRight className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-secondary">help</span>', '<HelpCircle className="w-4 h-4 text-secondary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-secondary text-[22px]">sticky_note_2</span>', '<FileText className="w-5 h-5 text-secondary shrink-0" />');
code = code.replace("{idx === 0 && <span className=\"material-symbols-outlined text-[14px]\">eco</span>}", "{idx === 0 && <Leaf className=\"w-3.5 h-3.5 shrink-0\" />}");
code = code.replace('<span className="material-symbols-outlined text-[16px]">add_comment</span>', '<MessageSquarePlus className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[15px]">send</span>', '<Send className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">edit_note</span>', '<FileEdit className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[20px]">close</span>', '<X className="w-5 h-5" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">save</span>', '<Save className="w-4 h-4" />');

fs.writeFileSync('src/pages/admin/AdminCustomersPage.tsx', code, 'utf8');
console.log('AdminCustomersPage updated');

