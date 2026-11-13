const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboardPage.tsx', 'utf8');

const lucideImport = `import {
  Calendar,
  RefreshCw,
  PlusCircle,
  BellRing,
  CheckCircle2,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Plus,
  Globe,
  FileEdit,
  CalendarX,
  ChefHat,
  Inbox,
  Phone,
  ArrowRight,
  MailCheck,
  Clock,
  FilePlus,
  X,
  Armchair,
  MapPin,
  FileText,
  Utensils,
  PhoneCall,
  XCircle,
  ExternalLink
} from 'lucide-react'\n`;

code = code.replace("import { Link } from 'react-router-dom'", lucideImport + "import { Link } from 'react-router-dom'");

// Replacements
code = code.replace('<span className="material-symbols-outlined text-base text-amber-700">calendar_today</span>', '<Calendar className="w-4 h-4 text-amber-700 shrink-0" />');
code = code.replace(/<span className={`material-symbols-outlined text-lg text-\[#785A48\] \${isLoading \? 'animate-spin' : ''}`}>[\s\S]*?sync[\s\S]*?<\/span>/, '<RefreshCw className={`w-4 h-4 text-[#785A48] ${isLoading ? \'animate-spin\' : \'\'}`} />');
code = code.replace('<span className="material-symbols-outlined text-xl sm:text-2xl font-black">add_circle</span>', '<PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-3xl">notifications_active</span>', '<BellRing className="w-7 h-7" />');
code = code.replace('<span className="material-symbols-outlined text-3xl">verified</span>', '<CheckCircle2 className="w-7 h-7" />');
code = code.replace('<span className="material-symbols-outlined text-3xl">event_available</span>', '<CalendarCheck className="w-7 h-7" />');
code = code.replace('<span className="material-symbols-outlined text-2xl text-[#8B0A00]">calendar_month</span>', '<CalendarDays className="w-6 h-6 text-[#8B0A00] shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-lg">chevron_left</span>', '<ChevronLeft className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-lg">chevron_right</span>', '<ChevronRight className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-sm text-amber-700">touch_app</span>', '<MousePointerClick className="w-3.5 h-3.5 text-amber-700 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-base">add</span>', '<Plus className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-sm text-green-700">verified</span>', '<CheckCircle2 className="w-3.5 h-3.5 text-green-700 shrink-0" />');
code = code.replace(/<span className="material-symbols-outlined text-\[12px\]">[\s\S]*?\{ord\.source === 'Online' \? 'language' : 'edit_note'\}[\s\S]*?<\/span>/, "{ord.source === 'Online' ? <Globe className=\"w-3 h-3\" /> : <FileEdit className=\"w-3 h-3\" />}");
code = code.replace('<span className="material-symbols-outlined text-3xl">event_busy</span>', '<CalendarX className="w-8 h-8" />');
code = code.replace('<span className="material-symbols-outlined text-sm">soup_kitchen</span>', '<ChefHat className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-2xl text-amber-600">inbox</span>', '<Inbox className="w-6 h-6 text-amber-600 shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-xs text-[#8B0A00]">call</span>', '<Phone className="w-3 h-3 text-[#8B0A00] shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-base">arrow_forward</span>', '<ArrowRight className="w-4 h-4" />');
code = code.replace('<span className="material-symbols-outlined text-4xl text-amber-700/50 mb-1">mark_email_read</span>', '<MailCheck className="w-10 h-10 text-amber-700/50 mb-1" />');
code = code.replace('<span className="material-symbols-outlined text-2xl text-[#8B0A00]">pending_actions</span>', '<Clock className="w-6 h-6 text-[#8B0A00] shrink-0" />');
code = code.replace('<span className="material-symbols-outlined text-xs">arrow_forward</span>', '<ArrowRight className="w-3 h-3" />');
code = code.replace('<span className="material-symbols-outlined text-2xl">post_add</span>', '<FilePlus className="w-6 h-6" />');
code = code.replace('<span className="material-symbols-outlined text-xl">close</span>', '<X className="w-5 h-5" />');
code = code.replace('<span className="material-symbols-outlined text-sm">call</span>', '<Phone className="w-3.5 h-3.5" />');
code = code.replace('<span className="material-symbols-outlined text-xl">close</span>', '<X className="w-5 h-5" />');
code = code.replace('<span className="material-symbols-outlined text-base text-[#8B0A00]">event_seat</span>', '<Armchair className="w-4 h-4 text-[#8B0A00]" />');
code = code.replace('<span className="material-symbols-outlined text-lg text-[#8B0A00] shrink-0 mt-0.5">location_on</span>', '<MapPin className="w-4 h-4 text-[#8B0A00] shrink-0 mt-0.5" />');
code = code.replace('<span className="material-symbols-outlined text-lg text-amber-700 shrink-0 mt-0.5">notes</span>', '<FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />');
code = code.replace('<span className="material-symbols-outlined text-base text-[#8B0A00]">restaurant_menu</span>', '<Utensils className="w-4 h-4 text-[#8B0A00]" />');
code = code.replace('<span className="material-symbols-outlined text-2xl text-green-700 group-hover:scale-110 transition-transform">check_circle</span>', '<CheckCircle2 className="w-6 h-6 text-green-700 group-hover:scale-110 transition-transform" />');
code = code.replace('<span className="material-symbols-outlined text-green-800 group-hover:translate-x-0.5 transition-transform">chevron_right</span>', '<ChevronRight className="w-5 h-5 text-green-800 group-hover:translate-x-0.5 transition-transform" />');
code = code.replace('<span className="material-symbols-outlined text-2xl text-yellow-700 group-hover:scale-110 transition-transform">phone_in_talk</span>', '<PhoneCall className="w-6 h-6 text-yellow-700 group-hover:scale-110 transition-transform" />');
code = code.replace('<span className="material-symbols-outlined text-yellow-800 group-hover:translate-x-0.5 transition-transform">chevron_right</span>', '<ChevronRight className="w-5 h-5 text-yellow-800 group-hover:translate-x-0.5 transition-transform" />');
code = code.replace('<span className="material-symbols-outlined text-xl text-red-600">cancel</span>', '<XCircle className="w-5 h-5 text-red-600" />');
code = code.replace('<span className="material-symbols-outlined text-sm">open_in_new</span>', '<ExternalLink className="w-3.5 h-3.5" />');

fs.writeFileSync('src/pages/admin/AdminDashboardPage.tsx', code, 'utf8');
console.log('AdminDashboardPage updated successfully');

