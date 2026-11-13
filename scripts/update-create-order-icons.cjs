const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminCreateOrderPage.tsx', 'utf8');

const lucideImport = `import {
  ArrowLeft,
  PhoneCall,
  Info,
  CheckCircle2,
  ShieldCheck,
  Check,
  User,
  PartyPopper,
  Plus,
  UtensilsCrossed,
  X,
  Calculator,
  Shield,
  Circle,
  Lightbulb,
  Bookmark
} from 'lucide-react'\n`;

code = code.replace("import React, { useState, useEffect, useMemo, useRef } from 'react'", "import React, { useState, useEffect, useMemo, useRef } from 'react'\n" + lucideImport);

code = code.replace('<span className="material-symbols-outlined text-sm font-semibold">arrow_back</span>', '<ArrowLeft className="w-4 h-4 shrink-0 font-semibold" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">phone_in_talk</span>', '<PhoneCall className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-secondary text-[20px]">info</span>', '<Info className="w-5 h-5 text-secondary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[14px] text-emerald-700">check_circle</span>', '<CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />');
code = code.replace(/<span className="material-symbols-outlined text-emerald-800 mt-0\.5 text-2xl shrink-0">[\s\S]*?verified_user[\s\S]*?<\/span>/, '<ShieldCheck className="w-6 h-6 text-emerald-800 mt-0.5 shrink-0" />');

code = code.replace('<span className="material-symbols-outlined text-[18px]">check_circle</span>', '<CheckCircle2 className="w-4.5 h-4.5 shrink-0" />');
code = code.replace(/<span className="material-symbols-outlined text-\[13px\]">[\s\S]*?\{isMobileValid \? 'done' : 'info'\}[\s\S]*?<\/span>/, "{isMobileValid ? <Check className=\"w-3.5 h-3.5\" /> : <Info className=\"w-3.5 h-3.5\" />}");

code = code.replace('<span className="material-symbols-outlined text-[18px]">person</span>', '<User className="w-4.5 h-4.5 shrink-0" />');
code = code.replace(/<span className="material-symbols-outlined text-\[14px\]">[\s\S]*?\{isSelected \? 'check' : 'add'\}[\s\S]*?<\/span>/, "{isSelected ? <Check className=\"w-3.5 h-3.5\" /> : <Plus className=\"w-3.5 h-3.5\" />}");
code = code.replace('<span className="material-symbols-outlined text-[20px]">celebration</span>', '<PartyPopper className="w-5 h-5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[13px]">check_circle</span>', '<CheckCircle2 className="w-3.5 h-3.5 shrink-0" />');

code = code.replace('<span className="material-symbols-outlined text-[16px]">check_circle</span>', '<CheckCircle2 className="w-4 h-4 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[14px]">check</span>', '<Check className="w-3.5 h-3.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[14px]">add</span>', '<Plus className="w-3.5 h-3.5 shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined text-primary text-\[20px\]">[\s\S]*?local_dining[\s\S]*?<\/span>/, '<UtensilsCrossed className="w-5 h-5 text-primary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">close</span>', '<X className="w-4 h-4" />');

code = code.replace(/<span className="material-symbols-outlined text-primary text-\[20px\]">[\s\S]*?calculate[\s\S]*?<\/span>/, '<Calculator className="w-5 h-5 text-primary shrink-0" />');
code = code.replace(/<span className="material-symbols-outlined text-secondary text-\[20px\]">[\s\S]*?shield_person[\s\S]*?<\/span>/, '<Shield className="w-5 h-5 text-secondary shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined text-\[16px\]">[\s\S]*?\{isMobileValid \? 'check_circle' : 'radio_button_unchecked'\}[\s\S]*?<\/span>/, "{isMobileValid ? <CheckCircle2 className=\"w-4 h-4\" /> : <Circle className=\"w-4 h-4\" />}");
code = code.replace(/<span className="material-symbols-outlined text-\[16px\]">[\s\S]*?\{isDateValid \? 'check_circle' : 'radio_button_unchecked'\}[\s\S]*?<\/span>/, "{isDateValid ? <CheckCircle2 className=\"w-4 h-4\" /> : <Circle className=\"w-4 h-4\" />}");
code = code.replace(/<span className="material-symbols-outlined text-\[16px\]">[\s\S]*?\{isPlatesValid \? 'check_circle' : 'radio_button_unchecked'\}[\s\S]*?<\/span>/, "{isPlatesValid ? <CheckCircle2 className=\"w-4 h-4\" /> : <Circle className=\"w-4 h-4\" />}");

code = code.replace('<span className="material-symbols-outlined text-secondary text-sm">lightbulb</span>', '<Lightbulb className="w-3.5 h-3.5 text-secondary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-outline text-[18px]">bookmark</span>', '<Bookmark className="w-4.5 h-4.5 text-outline shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">check_circle</span>', '<CheckCircle2 className="w-4.5 h-4.5 shrink-0" />');

fs.writeFileSync('src/pages/admin/AdminCreateOrderPage.tsx', code, 'utf8');
console.log('AdminCreateOrderPage updated');

