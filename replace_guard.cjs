const fs = require('fs');
const path = 'C:\\Users\\user\\Desktop\\Resident App\\src\\App.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Guard header to glass
content = content.replace(
  /className="bg-\[#1a1a1a\] px-6 pt-14 md:pt-16 pb-4 border-b border-white\/5 z-10 shrink-0"/g,
  'className="bg-black/60 backdrop-blur-3xl px-6 pt-14 md:pt-16 pb-4 border-b border-white/10 z-10 shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"'
);

content = content.replace(
  /className="w-12 h-12 rounded-full bg-emerald-900\/50 flex items-center justify-center text-emerald-400 border border-emerald-500\/30"/g,
  'className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[inset_0_1px_0_rgba(16,185,129,0.2)]"'
);

// 2. Guard manual entry form inputs to glass
content = content.replace(
  /className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3\.5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"/g,
  'className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"'
);

content = content.replace(
  /className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3\.5 text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors uppercase"/g,
  'className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner uppercase"'
);

// 3. Quick Actions Grid mobile fix
content = content.replace(
  /className="grid grid-cols-4 gap-3 sm:gap-4"/g,
  'className="grid grid-cols-4 gap-2 sm:gap-4"'
);

// Find the Quick action buttons and shrink them safely
content = content.replace(/w-\[72px\] h-\[72px\] rounded-\[1\.5rem\]/g, 'w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-[1.25rem] sm:rounded-[1.5rem]');
content = content.replace(/w-7 h-7 drop-shadow-md/g, 'w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md');
content = content.replace(/text-\[11px\] font-extrabold text-slate-300 text-center/g, 'text-[10px] sm:text-[11px] font-extrabold text-slate-300 text-center');

// 4. Guard Recent Scans glass cards
content = content.replace(
  /className="bg-slate-800\/50 rounded-2xl p-4 border border-slate-700\/50 flex items-center justify-between mb-3"/g,
  'className="glass-card interactive-card bg-white/5 p-4 flex items-center justify-between mb-3 hover:-translate-y-1 border border-white/10"'
);

content = content.replace(
  /className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-slate-300"/g,
  'className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-slate-300 shadow-inner border border-white/5"'
);

// 5. Admin customization settings: ensure consistency
content = content.replace(
  /className="w-12 h-6 rounded-full transition-colors relative/g,
  'className="w-12 h-6 rounded-full transition-colors relative shadow-inner border border-white/20'
);

// 6. Admin ticket actions: sync data better
// Ensure that when a ticket is changed, it syncs with AI classification appropriately
content = content.replace(
  /const handleAdminTicketStatusChange = \(ticketId, newStatus\) => \{/g,
  'const handleAdminTicketStatusChange = (ticketId, newStatus) => {\n    // Log action internally to Memory\n    setGuardLogs(prev => [{ type: `Ticket ${ticketId} status updated to ${newStatus}`, unit: "Admin Action", scanTime: new Date().toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"}) }, ...prev]);\n'
);

// 7. Ensure no horizontal scrolling by fixing the 414px device container on mobile
content = content.replace(
  /className="w-full h-full md:w-\[414px\] md:h-\[896px\] bg-background md:rounded-\[3\.5rem\] md:shadow-elevation-5 relative overflow-hidden flex flex-col md:border-\[6px\] md:border-\[#1a1a1a\] z-10 transition-transform duration-500 hover:scale-\[1\.01\]"/g,
  'className="w-full h-[100dvh] md:w-[414px] md:h-[896px] bg-background md:rounded-[3.5rem] md:shadow-elevation-5 relative overflow-x-hidden flex flex-col md:border-[6px] md:border-[#1a1a1a] z-10 transition-transform duration-500 hover:scale-[1.01] max-w-full"'
);

// 8. Fix Guard Screen padding and overflow
content = content.replace(
  /className="w-full h-full md:w-\[414px\] md:h-\[896px\] bg-\[#121212\] md:rounded-\[3\.5rem\] md:shadow-\[0_0_0_2px_#333,0_0_0_12px_#000,0_50px_100px_-20px_rgba\(0,0,0,0\.8\)\] relative overflow-hidden flex flex-col md:border-4 md:border-\[#1a1a1a\] z-10"/g,
  'className="w-full h-[100dvh] md:w-[414px] md:h-[896px] bg-[#121212] md:rounded-[3.5rem] md:shadow-[0_0_0_2px_#333,0_0_0_12px_#000,0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-x-hidden flex flex-col md:border-4 md:border-[#1a1a1a] z-10 max-w-full"'
);

fs.writeFileSync(path, content, 'utf8');
console.log('App.jsx successfully patched!');
