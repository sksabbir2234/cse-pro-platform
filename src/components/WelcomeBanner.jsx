export default function WelcomeBanner() {
  return (
    <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="lg:col-span-2 relative overflow-hidden bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Welcome Note
            </span>
            <div className="h-[1px] flex-1 bg-slate-100"></div>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            প্রিয় সিএসই বন্ধু ও <span className="text-indigo-600">চাকরিপ্রার্থী,</span>
          </h2>
          <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base max-w-2xl">
            সঠিক গাইডলাইনের অভাবে অনেক প্রতিভা হারিয়ে যায়। আপনাদের সফলতার পথ সহজ করতে আমাদের এই ক্ষুদ্র প্রচেষ্টা। 
            <span className="text-slate-800 font-bold ml-1">নিয়মিত প্র্যাকটিস করুন, সফল আপনি হবেনই! 🚀</span>
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-1 rounded-[32px] shadow-lg shadow-pink-100">
        <div className="bg-white h-full w-full rounded-[30px] p-6 flex flex-col items-center justify-center text-center">
          <p className="text-pink-600 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Support Project</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-pink-600 font-black text-sm">৳</span>
            </div>
            <span className="text-slate-800 font-black text-xl tracking-tighter">01822081186</span>
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase">বিকাশ পার্সোনাল</p>
        </div>
      </div>
    </div>
  );
}