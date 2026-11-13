const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminOrderDetailPage.tsx', 'utf8');

const lucideImport = `import {
  SlidersHorizontal,
  Receipt,
  BookOpen,
  XCircle,
  ArrowLeft,
  Store,
  Globe,
  Copy,
  CheckCircle2,
  UserCheck,
  Check,
  Phone,
  Sparkles,
  Plus,
  X,
  Info,
  CheckSquare,
  Lock,
  Eye,
  Download,
  Share2,
  FileText,
  Printer,
  MessageSquare,
  Tv,
  Mail,
  Link2,
  ShieldCheck
} from 'lucide-react'\n`;

code = code.replace("import React, { useState, useEffect, useRef } from 'react'", "import React, { useState, useEffect, useRef } from 'react'\n" + lucideImport);

code = code.replace('<span className="material-symbols-outlined text-[16px]">tune</span>', '<SlidersHorizontal className="w-4 h-4 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[14px]">receipt</span>', '<Receipt className="w-3.5 h-3.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[14px]">menu_book</span>', '<BookOpen className="w-3.5 h-3.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-error text-[24px]">cancel</span>', '<XCircle className="w-6 h-6 text-error shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">arrow_back</span>', '<ArrowLeft className="w-4.5 h-4.5 shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined text-\[15px\] text-tertiary">[\s\S]*?\{order\?\.source === 'Manual' \? 'storefront' : 'public'\}[\s\S]*?<\/span>/, "{order?.source === 'Manual' ? <Store className=\"w-3.5 h-3.5 text-tertiary shrink-0\" /> : <Globe className=\"w-3.5 h-3.5 text-tertiary shrink-0\" />}");

code = code.replace('<span className="material-symbols-outlined text-[18px]">content_copy</span>', '<Copy className="w-4.5 h-4.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">check_circle</span>', '<CheckCircle2 className="w-4.5 h-4.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">cancel</span>', '<XCircle className="w-4 h-4 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[22px]">person_pin</span>', '<UserCheck className="w-5.5 h-5.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[15px]">check</span>', '<Check className="w-3.5 h-3.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[14px]">call</span>', '<Phone className="w-3.5 h-3.5 shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined text-secondary text-\[20px\] mt-0\.5">[\s\S]*?temple_hindu[\s\S]*?<\/span>/, '<Sparkles className="w-5 h-5 text-secondary mt-0.5 shrink-0" />');

code = code.replace('<span className="material-symbols-outlined text-[18px]">add</span>', '<Plus className="w-4.5 h-4.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">close</span>', '<X className="w-4.5 h-4.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-secondary text-[18px]">info</span>', '<Info className="w-4.5 h-4.5 text-secondary shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined text-\[20px\]">[\s\S]*?\{currentStatus === 'Confirmed' \? 'check_circle' : 'assignment_turned_in'\}[\s\S]*?<\/span>/, "{currentStatus === 'Confirmed' ? <CheckCircle2 className=\"w-5 h-5 shrink-0\" /> : <CheckSquare className=\"w-5 h-5 shrink-0\" />}");

code = code.replace('<span className="material-symbols-outlined text-[18px] text-primary">receipt</span>', '<Receipt className="w-4.5 h-4.5 text-primary shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined text-outline text-\[22px\] block mx-auto mb-1">[\s\S]*?lock[\s\S]*?<\/span>/, '<Lock className="w-5.5 h-5.5 text-outline block mx-auto mb-1" />');

code = code.replace('<span className="material-symbols-outlined text-[18px]">visibility</span>', '<Eye className="w-4.5 h-4.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-secondary">download</span>', '<Download className="w-4 h-4 text-secondary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-primary">share</span>', '<Share2 className="w-4 h-4 text-primary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[20px]">receipt</span>', '<Receipt className="w-5 h-5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">check_circle</span>', '<CheckCircle2 className="w-4.5 h-4.5 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[28px]">check_circle</span>', '<CheckCircle2 className="w-7 h-7 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-primary text-[24px]">description</span>', '<FileText className="w-6 h-6 text-primary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">print</span>', '<Printer className="w-4 h-4 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">download</span>', '<Download className="w-4 h-4 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined">close</span>', '<X className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>', '<BookOpen className="w-6 h-6 text-primary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined">close</span>', '<X className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">add</span>', '<Plus className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined">close</span>', '<X className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined">chat</span>', '<MessageSquare className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined">airplay</span>', '<Tv className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined">mail</span>', '<Mail className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined">link</span>', '<Link2 className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[28px]">shield_lock</span>', '<ShieldCheck className="w-7 h-7" />');

fs.writeFileSync('src/pages/admin/AdminOrderDetailPage.tsx', code, 'utf8');
console.log('AdminOrderDetailPage updated');

