const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminOrdersPage.tsx', 'utf8');

const lucideImport = `import {
  Calendar,
  Phone,
  PlusCircle,
  Printer,
  Table,
  Search,
  CalendarRange,
  ChevronDown,
  FilterX,
  Globe,
  PhoneCall,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2
} from 'lucide-react'\n`;

code = code.replace("import { Link, useSearchParams } from 'react-router-dom'", lucideImport + "import { Link, useSearchParams } from 'react-router-dom'");

code = code.replace('<span className="material-symbols-outlined text-[15px] text-amber-700">calendar_today</span>', '<Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-primary">call</span>', '<Phone className="w-4 h-4 text-primary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[18px]">add_circle</span>', '<PlusCircle className="w-4 h-4 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-primary">print</span>', '<Printer className="w-4 h-4 text-primary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">table_view</span>', '<Table className="w-4 h-4 shrink-0" />');

code = code.replace(/<span className="material-symbols-outlined absolute left-3\.5 top-1\/2 -translate-y-1\/2 text-outline text-\[20px\] pointer-events-none">[\s\S]*?search[\s\S]*?<\/span>/, '<Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />');
code = code.replace(/<span className="material-symbols-outlined absolute left-2\.5 top-1\/2 -translate-y-1\/2 text-\[16px\] text-outline pointer-events-none">[\s\S]*?date_range[\s\S]*?<\/span>/, '<CalendarRange className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />');
code = code.replace(/<span className="material-symbols-outlined absolute right-2\.5 top-1\/2 -translate-y-1\/2 text-\[16px\] text-outline pointer-events-none">[\s\S]*?expand_more[\s\S]*?<\/span>/, '<ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />');

code = code.replace('<span className="material-symbols-outlined text-[36px]">filter_alt_off</span>', '<FilterX className="w-9 h-9" />');
code = code.replace('<span className="material-symbols-outlined text-[13px]">language</span>', '<Globe className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[13px]">phone_in_talk</span>', '<PhoneCall className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">arrow_forward</span>', '<ArrowRight className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[15px]">call</span>', '<Phone className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[15px]">chevron_right</span>', '<ChevronRight className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">chevron_left</span>', '<ChevronLeft className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">chevron_right</span>', '<ChevronRight className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[20px]">close</span>', '<X className="w-5 h-5" />');
code = code.replace('<span className="material-symbols-outlined text-[16px] text-secondary">call</span>', '<Phone className="w-4 h-4 text-secondary shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-[16px]">print</span>', '<Printer className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-[20px]">close</span>', '<X className="w-5 h-5" />');

code = code.replace(/<span className="material-symbols-outlined text-\[18px\] text-emerald-600">[\s\S]*?check_circle[\s\S]*?<\/span>/, '<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />');

fs.writeFileSync('src/pages/admin/AdminOrdersPage.tsx', code, 'utf8');
console.log('AdminOrdersPage updated');

