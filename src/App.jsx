import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, updateDoc, addDoc, writeBatch } from 'firebase/firestore';
import { 
  Users, BookOpen, Calendar, Plus, Check, X, Clock, ChevronRight, LayoutDashboard,
  UserCircle, Save, Trash2, Heart, Sparkles, Settings, HardDrive, Globe, FolderOpen, 
  History, ClipboardList, Monitor, ChevronLeft, LogOut, Users2, Megaphone, Flag, ListChecks, AlertCircle, Edit3, CheckSquare, Database, Lock
} from 'lucide-react';

// --------------------------------------------------------------------------------
// 1. Firebase Configuration (선생님 전용 설정 - Vercel 배포용)
// --------------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAhBsBu8BvHttPGJtpFPJxNEf6_TLIF0C0",
  authDomain: "vision-class-1461b.firebaseapp.com",
  projectId: "vision-class-1461b",
  storageBucket: "vision-class-1461b.firebasestorage.app",
  messagingSenderId: "1085621904229",
  appId: "1:1085621904229:web:34545f5783adb38670778c",
  measurementId: "G-H4RMZJ3SBS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --------------------------------------------------------------------------------
// 2. Constants & Utils
// --------------------------------------------------------------------------------
const INITIAL_SCHEDULE = {
  '월': [{start:'09:10', end:'11:00', s:'예배 / 그림전도'}, {start:'11:10', end:'12:30', s:'S&L (AI)'}, {start:'12:30', end:'14:00', s:'점심시간'}, {start:'14:00', end:'15:50', s:'자연과학 LAB'}, {start:'16:00', end:'16:50', s:'영어 (SOT)'}, {start:'16:50', end:'17:30', s:'저녁시간'}, {start:'17:30', end:'19:00', s:'자율학습'}],
  '화': [{start:'09:10', end:'10:00', s:'수학'}, {start:'10:10', end:'11:00', s:'영어 (SOT)'}, {start:'11:10', end:'12:30', s:'국어'}, {start:'12:30', end:'14:00', s:'점심시간'}, {start:'14:00', end:'15:50', s:'드로잉'}, {start:'16:00', end:'16:50', s:'IT & 경제'}, {start:'16:50', end:'17:30', s:'저녁시간'}, {start:'17:30', end:'19:00', s:'자율학습'}],
  '수': [{start:'09:10', end:'10:00', s:'평신도선교'}, {start:'10:10', end:'12:30', s:'Activity(EN)'}, {start:'12:30', end:'14:00', s:'점심시간'}, {start:'14:00', end:'15:50', s:'진로 탐구'}, {start:'16:00', end:'16:50', s:'동아리'}, {start:'16:50', end:'17:30', s:'저녁시간'}, {start:'17:30', end:'19:00', s:'자율학습'}],
  '목': [{start:'09:10', end:'11:00', s:'체육'}, {start:'11:10', end:'12:30', s:'역사'}, {start:'12:30', end:'14:00', s:'점심시간'}, {start:'14:00', end:'14:50', s:'CA'}, {start:'15:00', end:'15:50', s:'S & L'}, {start:'16:00', end:'16:50', s:'IT & 경제'}, {start:'16:50', end:'17:30', s:'저녁시간'}, {start:'17:30', end:'19:00', s:'자율학습'}],
  '금': [{start:'09:10', end:'11:00', s:'수학'}, {start:'11:10', end:'12:00', s:'PEER Class'}, {start:'12:00', end:'12:30', s:'자기점검'}, {start:'12:30', end:'14:00', s:'점심시간'}, {start:'14:00', end:'14:50', s:'시사'}, {start:'15:00', end:'16:50', s:'오케스트라'}, {start:'16:50', end:'17:30', s:'저녁시간'}, {start:'17:30', end:'19:00', s:'자율학습'}]
};

const timeToMinutes = (t) => { const [h, m] = (t || '00:00').split(':').map(Number); return h * 60 + m; };
const getBlockStyle = (s) => {
  if (s.includes('점심') || s.includes('저녁')) return 'bg-orange-100 border-l-4 border-orange-400 text-orange-900';
  if (s.includes('자율') || s.includes('자기점검')) return 'bg-teal-100 border-l-4 border-teal-400 text-teal-900';
  if (s.includes('예배') || s.includes('선교') || s.includes('Activity')) return 'bg-fuchsia-100 border-l-4 border-fuchsia-400 text-fuchsia-900';
  return 'bg-blue-100 border-l-4 border-blue-400 text-blue-900'; 
};
const getBlockIcon = (s) => {
  if (s.includes('점심')) return '🍱'; if (s.includes('저녁')) return '🍔'; if (s.includes('자율')) return '🌿'; if (s.includes('예배')) return '🙏';
  if (s.includes('수학')) return '📐'; if (s.includes('영어') || s.includes('English')) return '📚'; return '📖';
};

// --------------------------------------------------------------------------------
// 3. UI Components
// --------------------------------------------------------------------------------

function NavItem({ icon, label, active, onClick, badge }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <div className="flex items-center gap-3">{icon}<span className="font-bold text-[13px]">{label}</span></div>
      {badge > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">{badge}</span>}
    </button>
  );
}

function Section({ title, sub, onAdd, children }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-100 pb-5 gap-4">
        <div><h2 className="text-2xl font-black tracking-tighter text-slate-900">{title}</h2><p className="text-slate-400 text-xs font-medium mt-1">{sub}</p></div>
        {onAdd && <button onClick={onAdd} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-600 transition-all font-bold text-[13px] shadow-sm w-full sm:w-auto justify-center"><Plus size={16}/> 새로운 항목 추가</button>}
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, unit, icon, onClick, clickable, color = "bg-white" }) {
  return (
    <div onClick={onClick} className={`${color} p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 transition-all duration-500 ${clickable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100' : ''}`}>
      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-50">{icon}</div>
      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1 text-slate-900"><span className="text-3xl font-black">{value}</span><span className="text-slate-400 text-[12px] font-bold ml-0.5">{unit}</span></div>
    </div>
  );
}

function OfficerBadge({ label, name }) {
  const roleConfig = { '대의원': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', emoji: '👑' }, '부대의원': { color: 'bg-blue-50 text-blue-700 border-blue-200', emoji: '🌟' }, '서기': { color: 'bg-green-50 text-green-700 border-green-200', emoji: '📝' } };
  const config = roleConfig[label] || { color: 'bg-slate-50 text-slate-700 border-slate-200', emoji: '🧑‍🎓' };
  return (
    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 ${config.color} flex flex-col items-center justify-center shadow-sm shrink-0 hover:scale-105 transition-transform`}>
      <span className="text-[14px] md:text-[16px] leading-none mb-0.5">{config.emoji}</span><span className="text-[9px] md:text-[10px] font-black leading-none truncate w-full text-center px-1">{name}</span>
    </div>
  );
}

function LinkMini({ icon, url, color }) {
  if (!url) return <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-slate-50 text-slate-200 flex items-center justify-center">{icon}</div>;
  return (<a href={url} target="_blank" rel="noopener noreferrer" className={`w-8 h-8 md:w-10 md:h-10 rounded-lg ${color} text-white flex items-center justify-center shadow-lg transition-all hover:scale-110`}>{icon}</a>);
}

// --------------------------------------------------------------------------------
// 4. 로그인 및 모달
// --------------------------------------------------------------------------------
function LoginScreen({ onLogin }) {
  const names = ['강태원', '김남우', '원의재', '현준서', '강서연', '유명희', '권새롬', '김사랑', '김현우'];
  const [selectedName, setSelectedName] = useState(names[0]);
  const [pin, setPin] = useState('');
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  const handleLogin = () => {
    if (isTeacherMode) {
      if (pin === '2026!') onLogin({ name: '관리자', role: 'teacher' });
      else alert('관리자 비밀번호가 일치하지 않습니다.');
    } else {
      if (pin === '1111') onLogin({ name: selectedName, role: 'student' });
      else alert('학생 접속 PIN이 일치하지 않습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[100] p-6 animate-in fade-in duration-700">
      <button onClick={() => { setIsTeacherMode(!isTeacherMode); setPin(''); }} className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors flex items-center gap-2">
         <span className="text-xs font-bold">{isTeacherMode ? '학생 접속' : '교사 접속'}</span>{isTeacherMode ? <UserCircle size={24}/> : <Lock size={24}/>}
      </button>
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 md:p-12 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
         <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner"><Sparkles size={40} className="text-indigo-600"/></div>
         <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Vision High</h2>
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{isTeacherMode ? 'Teacher Admin' : 'Student Portal'}</p>
         <div className="w-full space-y-4">
            {!isTeacherMode ? (
              <div className="text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Select Name</label><select value={selectedName} onChange={(e)=>setSelectedName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none text-center">{names.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            ) : (
              <div className="text-left"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Admin ID</label><div className="w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl font-black text-slate-800 text-center opacity-70">교사 관리자 (Master)</div></div>
            )}
            <div className="text-left pt-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">{isTeacherMode ? 'Password' : 'Access PIN'}</label><input type="password" maxLength={isTeacherMode ? 20 : 4} value={pin} onChange={(e) => setPin(isTeacherMode ? e.target.value : e.target.value.replace(/[^0-9]/g, ''))} placeholder={isTeacherMode ? "비밀번호 입력" : "4자리 숫자 입력"} className={`w-full bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl font-black text-slate-800 text-center outline-none focus:ring-4 focus:ring-indigo-100 transition-all ${isTeacherMode ? 'tracking-widest' : 'tracking-[1em]'}`} onKeyDown={(e) => e.key === 'Enter' && handleLogin()}/></div>
            {isTeacherMode && <p className="text-[10px] text-indigo-400 font-bold mt-2">* 관리자 비밀번호: 2026!</p>}{!isTeacherMode && <p className="text-[10px] text-indigo-400 font-bold mt-2">* 초기 PIN 번호: 1111</p>}
            <button onClick={handleLogin} className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-1 transition-all">시스템 접속</button>
         </div>
      </div>
    </div>
  );
}

function FormModal({ title, fields, initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState(initialData || {});
  const handleChange = (name, val) => { setFormData(prev => ({ ...prev, [name]: val })); };
  const handleSubmit = () => { if (fields.some(f => f.name === 'dueDate' && !formData.dueDate)) return; onSubmit(formData); };
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 text-[14px]">
      <div className="bg-white w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col">
        <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 text-slate-900"><h3 className="font-black text-2xl md:text-4xl tracking-tight">{title}</h3><button onClick={onClose} className="p-2 md:p-3 hover:bg-white rounded-full text-slate-400 transition-colors bg-white shadow-sm border border-slate-100"><X size={24} className="md:w-8 md:h-8"/></button></div>
        <div className="p-8 md:p-12 space-y-8 md:space-y-10 overflow-y-auto flex-grow custom-scrollbar">
          {fields.map(f => (<div key={f.name}><label className="text-[11px] md:text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 md:mb-4 block pl-2">{f.label}</label>{f.type === 'select' ? (<select value={formData[f.name] || ''} onChange={e => handleChange(f.name, e.target.value)} className="w-full px-6 md:px-8 py-4 md:py-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] focus:ring-4 focus:ring-indigo-100 font-bold text-base md:text-lg outline-none appearance-none transition-all">{f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select>) : f.type === 'date' ? (<input type="date" value={formData[f.name] || ''} onChange={e => handleChange(f.name, e.target.value)} className="w-full px-6 md:px-8 py-4 md:py-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] font-bold text-base md:text-lg outline-none focus:ring-4 focus:ring-indigo-100 transition-all" />) : f.type === 'textarea' ? (<textarea rows="5" value={formData[f.name] || ''} onChange={e => handleChange(f.name, e.target.value)} className="w-full px-6 md:px-8 py-5 md:py-6 bg-slate-50 border border-slate-200 rounded-[2rem] md:rounded-[3rem] font-medium text-base md:text-lg outline-none focus:ring-4 focus:ring-indigo-100 leading-relaxed transition-all" placeholder="상세 내용을 작성하세요..." />) : (<input type={f.type || 'text'} value={formData[f.name] || ''} onChange={e => handleChange(f.name, e.target.value)} className="w-full px-6 md:px-8 py-4 md:py-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] font-medium text-base md:text-lg outline-none focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="입력..." />)}</div>))}
        </div>
        <div className="p-6 md:p-10 border-t border-slate-100 bg-slate-50/80 shrink-0"><div className="flex gap-4 md:gap-6"><button onClick={onClose} className="flex-1 bg-white border border-slate-200 text-slate-500 py-5 md:py-7 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl hover:bg-slate-100 shadow-sm transition-all">취소</button><button onClick={handleSubmit} className="flex-[2] bg-indigo-600 text-white py-5 md:py-7 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-lg md:text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-indigo-200"><Save size={24} className="md:w-7 md:h-7" /> 완료</button></div></div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------
// 5. Main App
// --------------------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState(null); 
  const [authUser, setAuthUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState({}); 
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [classSettings, setClassSettings] = useState({ bibleRange: '사도행전 1~10장' });
  const [isModalOpen, setIsModalOpen] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [groupSubmitConfig, setGroupSubmitConfig] = useState(null);

  // Firebase 연결 초기화
  useEffect(() => {
    signInAnonymously(auth).catch(e => console.error("Firebase Login Error:", e));
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 데이터 가져오기 (실제 Vercel 환경에 맞게 경로를 깔끔하게 정리했습니다.)
  useEffect(() => {
    if (!user) return;
    const unsubS = onSnapshot(collection(db, 'students'), (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSubj = onSnapshot(collection(db, 'subjects'), (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubT = onSnapshot(collection(db, 'tasks'), (snap) => setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSubm = onSnapshot(collection(db, 'submissions'), (snap) => { const sm = {}; snap.docs.forEach(d => { sm[d.id] = d.data(); }); setSubmissions(sm); });
    const unsubSch = onSnapshot(doc(db, 'settings', 'schedule'), (d) => { if (d.exists()) setSchedule(d.data()); });
    const unsubCfg = onSnapshot(doc(db, 'settings', 'classConfig'), (d) => { if (d.exists()) setClassSettings(d.data()); });
    return () => { unsubS(); unsubSubj(); unsubT(); unsubSubm(); unsubSch(); unsubCfg(); };
  }, [user]);

  const seedData = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    const initialSubjects = [
      { title: '학생자치', representative: '대의원', category: 'Governance', isSpecial: true },
      { title: 'S&L', representative: '김남우', category: 'Core Focus' },
      { title: 'IT&경제', representative: '원의재', category: 'Exploration' },
      { title: '자연과학LAB', representative: '김현우', category: 'Exploration' },
      { title: 'English(SOT)', representative: '강서연', category: 'Core Focus' },
      { title: '수학', representative: '현준서', category: 'Core Focus' },
      { title: '진로탐구', representative: '강태원', category: 'Exploration' }
    ];
    initialSubjects.forEach(s => { batch.set(doc(collection(db, 'subjects')), { ...s, progress: 0, driveUrl:'', hiClassUrl:'', createdAt:new Date().toISOString()}); });
    ['강태원','김남우','원의재','현준서','강서연','유명희','권새롬','김사랑','김현우'].forEach(n => { batch.set(doc(collection(db, 'students')), { name: n, role: (n==='강서연')?'대의원':(n==='원의재')?'부대의원':(n==='김남우')?'서기':'학생', assignedSubjects: [], createdAt:new Date().toISOString() }); });
    batch.set(doc(db, 'settings', 'schedule'), INITIAL_SCHEDULE);
    await batch.commit();
    alert("초기 데이터 생성 완료! (새로고침을 한 번 해주세요)");
  };

  const handleAddTask = async (data) => {
    if (!data.dueDate) { alert("마감 날짜를 필수로 입력해주세요."); return; }
    const date = new Date(data.dueDate);
    const day = ['일','월','화','수','목','금','토'][date.getDay()];
    const finalData = { ...data, day, taskType: data.taskType || '개별 과제' };
    
    if (editingTask && editingTask.id) { await updateDoc(doc(db, 'tasks', editingTask.id), finalData); } 
    else { await addDoc(collection(db, 'tasks'), { ...finalData, status: authUser?.role === 'teacher' ? 'approved' : 'pending', createdAt: new Date().toISOString() }); }
    setEditingTask(null); setIsModalOpen(null);
  };

  if (!authUser) return <LoginScreen onLogin={setAuthUser} />;
  const role = authUser.role;

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-800 overflow-hidden font-sans text-[13px]">
      {/* Sidebar */}
      <nav className="w-56 md:w-64 bg-slate-900 text-white flex flex-col p-4 md:p-5 shadow-2xl shrink-0 z-20">
        <div className="mb-8 md:mb-12 p-3 md:p-4 border-b border-slate-800/80 text-center"><h1 className="text-[18px] md:text-[22px] font-black italic tracking-tighter flex items-center justify-center gap-2"><Sparkles size={18} className="text-indigo-400" /><span>VISION HIGH</span></h1></div>
        <div className="space-y-1.5 md:space-y-2 flex-grow">
          <NavItem icon={<LayoutDashboard size={18}/>} label={role === 'student' ? 'Dashboard' : '대시보드'} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          {role === 'teacher' && <NavItem icon={<Users size={18}/>} label="학급 경영" active={activeTab === 'homeroom'} onClick={() => setActiveTab('homeroom')} />}
          <NavItem icon={<FolderOpen size={18}/>} label="Subject Hub" active={activeTab === 'subjects'} onClick={() => {setActiveTab('subjects'); setSelectedSubject(null);}} />
          {role === 'teacher' && <NavItem icon={<ListChecks size={18}/>} label="제출 현황판" active={activeTab === 'status'} onClick={() => setActiveTab('status')} />}
          <NavItem icon={<Edit3 size={18}/>} label={role === 'student' ? 'Assistant Tasks' : '조교 활동'} active={activeTab === 'approval'} badge={tasks.filter(t => t.status === 'pending').length} onClick={() => setActiveTab('approval')} />
          <NavItem icon={<Calendar size={18}/>} label={role === 'student' ? 'Timetable' : '통합 시간표'} active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        </div>
        <div className="mt-auto pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/40 p-3.5 rounded-[1.2rem] flex items-center gap-3 border border-slate-700/50 justify-between">
             <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm ${role === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'}`}>{role === 'teacher' ? 'AD' : 'ST'}</div><p className="text-[11px] md:text-[12px] font-bold text-slate-200 tracking-widest">{authUser.name}</p></div>
             <button onClick={() => setAuthUser(null)} className="p-2 bg-slate-700/50 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><LogOut size={16}/></button>
          </div>
          {role === 'teacher' && (
            <div className="mt-3 flex bg-slate-800 p-1 rounded-xl gap-1">
              <button onClick={()=>setAuthUser({name:'관리자', role:'teacher'})} className="flex-1 py-1.5 rounded-lg text-[9px] font-black bg-indigo-600 text-white shadow-sm">교사뷰</button>
              <button onClick={()=>setAuthUser({name:'강태원', role:'student'})} className="flex-1 py-1.5 rounded-lg text-[9px] font-black text-slate-400">학생뷰</button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#F8F9FB] relative">
        <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12">
          {activeTab === 'dashboard' && <Dashboard role={role} students={students} subjects={subjects} tasks={tasks} classSettings={classSettings} schedule={schedule} onNavigateSubjects={() => setActiveTab('subjects')} onNavigateApproval={() => setActiveTab('approval')} onUpdateBible={() => setIsModalOpen('bible')} onOpenRoutine={() => setIsModalOpen('routine')} onSelectSubjectByTitle={(t)=> { const s = subjects.find(s=>s.title.includes(t.split(' ')[0])); if(s){setSelectedSubject(s); setActiveTab('subjects');} }} />}
          {activeTab === 'homeroom' && role === 'teacher' && <Section title="학급 경영 Hub" sub="스크롤 없이 임원진 및 조교 배정 현황을 한눈에 관리하세요."><HomeroomGrid students={students} onUpdateOfficer={async (id, r) => { const batch = writeBatch(db); students.forEach(s => { if (s.role === r) batch.update(doc(db, 'students', s.id), { role: '학생' }); }); batch.update(doc(db, 'students', id), { role: r }); await batch.commit(); }} onAssign={(s)=> { setEditingTask(s); setIsModalOpen('assignAssistant'); }} /></Section>}
          {activeTab === 'subjects' && <Section title="Subject Hub" sub="교과별 아카이빙 및 클라우드 연결 허브">{selectedSubject ? <SubjectDetailView role={role} subject={selectedSubject} tasks={tasks} students={students} submissions={submissions} onToggle={(tid, sn, type) => { setDoc(doc(db, 'submissions', `${tid}_${sn}`), { ...(submissions[`${tid}_${sn}`] || { student: false, teacher: false }), [type]: !(submissions[`${tid}_${sn}`]?.[type]) }); }} onBack={() => setSelectedSubject(null)} onEdit={() => setIsModalOpen('editSubject')} onAddNewTaskForSubject={(title) => { setEditingTask({ subjectId: title, taskType: '개별 과제' }); setIsModalOpen('task'); }} onGroupSubmit={(task) => setGroupSubmitConfig({task, currentUser: authUser})} /> : <SubjectFolderGrid subjects={subjects} onSelect={setSelectedSubject} />}</Section>}
          {activeTab === 'status' && role === 'teacher' && <StatusBoard tasks={tasks.filter(t => t.status === 'approved')} students={students} submissions={submissions} onToggle={(tid, sn, type) => { setDoc(doc(db, 'submissions', `${tid}_${sn}`), { ...(submissions[`${tid}_${sn}`] || { student: false, teacher: false }), [type]: !(submissions[`${tid}_${sn}`]?.[type]) }); }} />}
          {activeTab === 'approval' && <ApprovalList role={role} tasks={tasks} onApprove={(id) => updateDoc(doc(db, 'tasks', id), { status: 'approved', approvedAt: new Date().toISOString() })} onReject={(id) => updateDoc(doc(db, 'tasks', id), { status: 'rejected' })} onEdit={(t) => {setEditingTask(t); setIsModalOpen('task');}} onAdd={() => {setEditingTask({taskType: '개별 과제'}); setIsModalOpen('task');}} calculateDDay={(dueDate) => { if (!dueDate) return '-'; const td = new Date(); td.setHours(0,0,0,0); const tg = new Date(dueDate); tg.setHours(0,0,0,0); const diff = Math.ceil((tg - td) / (1000 * 60 * 60 * 24)); return diff === 0 ? 'Today' : (diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`); }} />}
          {activeTab === 'calendar' && (role === 'teacher' ? <ScheduleMaster schedule={schedule} onSave={(s)=>setDoc(doc(db, 'settings', 'schedule'), s)} role={role} /> : <ScheduleViewer schedule={schedule} />)}
          
          {/* 최초 관리자 화면에서 DB 생성 버튼 노출 */}
          {role === 'teacher' && students.length === 0 && activeTab === 'dashboard' && (
            <button onClick={seedData} className="fixed bottom-10 left-8 md:left-12 bg-amber-600 text-white px-8 py-4 rounded-full font-black shadow-[0_10px_30px_rgba(217,119,6,0.4)] flex items-center gap-3 hover:bg-amber-700 transition-transform active:scale-95 animate-bounce z-50">
              <Database size={20}/> 시스템 초기 데이터 생성
            </button>
          )}
        </div>
      </main>

      {/* 모달 창 관리 */}
      {isModalOpen === 'bible' && <FormModal title="성경 범위 설정" fields={[{name:'bibleRange', label:'읽을 범위 입력'}]} onSubmit={(data) => setDoc(doc(db, 'settings', 'classConfig'), { bibleRange: data.bibleRange }, { merge: true }).then(()=>setIsModalOpen(null))} onClose={()=>setIsModalOpen(null)} />}
      {isModalOpen === 'newSubject' && <FormModal title="새 과목 생성" fields={[{name:'title', label:'과목명'}, {name:'representative', label:'조교 이름'}, {name:'category', label:'분류', type:'select', options:['Core Focus', 'Exploration', 'Community', 'Other']}]} onSubmit={(data) => addDoc(collection(db, 'subjects'), {...data, progress:0, driveUrl:'', hiClassUrl:'', createdAt: new Date().toISOString()}).then(()=>setIsModalOpen(null))} onClose={()=>setIsModalOpen(null)} />}
      {isModalOpen === 'editSubject' && selectedSubject && <FormModal title="과목 설정 편집" initialData={selectedSubject} fields={[{name:'representative', label:'담당 조교 배정', type:'select', options: students.map(s => s.name)}, {name:'driveUrl', label:'공유 드라이브 (협업용)'}, {name:'hiClassUrl', label:'하이클래스 (제출용)'}, {name:'progress', label:'진도율(%)', type:'number'}]} onSubmit={(data) => updateDoc(doc(db, 'subjects', selectedSubject.id), data).then(()=>{setSelectedSubject({...selectedSubject, ...data}); setIsModalOpen(null);})} onClose={()=>setIsModalOpen(null)} />}
      {isModalOpen === 'task' && <FormModal title={editingTask && editingTask.id ? "활동 보고 수정" : "조교 활동 보고"} initialData={editingTask} fields={[{name:'title', label:'과업 요약'}, {name:'content', label:'상세 내용 작성', type:'textarea'}, {name:'subjectId', label:'대상 과목', type:'select', options: subjects.map(s => s.title)}, {name:'taskType', label:'과제 유형 (개별/그룹)', type:'select', options:['개별 과제', '그룹 과제', '일반 공지']}, {name:'dueDate', label:'마감 일자 (디데이 계산용)', type:'date'}]} onSubmit={handleAddTask} onClose={()=>{setIsModalOpen(null); setEditingTask(null);}} />}
      {isModalOpen === 'assignAssistant' && editingTask && <AssignmentModal student={editingTask} subjects={subjects} onSave={async (id, titles) => { const studentName = students.find(s => s.id === id)?.name; await updateDoc(doc(db, 'students', id), { assignedSubjects: titles }); const batch = writeBatch(db); subjects.forEach(sub => { if (titles.includes(sub.title)) batch.update(doc(db, 'subjects', sub.id), { representative: studentName }); }); await batch.commit(); setIsModalOpen(null); }} onClose={() => {setIsModalOpen(null); setEditingTask(null);}} />}
      {isModalOpen === 'routine' && <RoutineModal onAddTask={handleAddTask} onClose={()=>setIsModalOpen(null)} />}
      {groupSubmitConfig && <GroupSubmitModal config={groupSubmitConfig} students={students} onSave={async (taskId, selectedNames) => { const batch = writeBatch(db); selectedNames.forEach(name => { const subId = `${taskId}_${name}`; const current = submissions[subId] || { student: false, teacher: false }; batch.set(doc(db, 'submissions', subId), { ...current, student: true }); }); await batch.commit(); setGroupSubmitConfig(null); }} onClose={() => setGroupSubmitConfig(null)} />}
    </div>
  );
}

// Sub-components
function StatBlock({ label, value, icon, color }) {
  return (
    <div className={`${color} p-8 rounded-[2.5rem] border border-slate-100 flex flex-col shadow-sm`}>
      <div className="w-12 h-12 rounded-2xl bg-white shadow-inner flex items-center justify-center mb-6">{icon}</div>
      <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1 font-black text-3xl text-slate-800">{value}<span className="text-base text-slate-400">건</span></div>
    </div>
  );
}

function Dashboard({ role, students, subjects, tasks, classSettings, schedule, onNavigateSubjects, onNavigateApproval, onUpdateBible, onOpenRoutine, onSelectSubjectByTitle }) {
  const approvedTasks = tasks.filter(t => t.status === 'approved');
  const events = approvedTasks.filter(t => t.taskType === '일반 공지' || t.subjectId === '학생자치');
  const assignments = approvedTasks.filter(t => t.taskType !== '일반 공지' && t.subjectId !== '학생자치');
  const today = ['일','월','화','수','목','금','토'][new Date().getDay()];
  const todaySchedule = schedule[today] || [];
  const calculateDDay = (dueDate) => { if (!dueDate) return '-'; const td = new Date(); td.setHours(0,0,0,0); const tg = new Date(dueDate); tg.setHours(0,0,0,0); const diff = Math.ceil((tg - td) / (1000 * 60 * 60 * 24)); return diff === 0 ? 'Today' : (diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`); };
  const sortedOfficers = students.filter(s => ['대의원', '부대의원', '서기'].includes(s.role)).sort((a, b) => { const order = { '대의원': 1, '부대의원': 2, '서기': 3 }; return order[a.role] - order[b.role]; });
  const dayStartM = 9 * 60; const dayEndM = 19 * 60; const totalM = dayEndM - dayStartM;
  const now = new Date(); const nowM = now.getHours() * 60 + now.getMinutes();
  const nowPercent = Math.max(0, Math.min(100, ((nowM - dayStartM) / totalM) * 100));
  const isSchoolHours = nowM >= dayStartM && nowM <= dayEndM;

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end px-2 pt-2 border-b border-slate-200/50 pb-4 md:pb-6 gap-4">
         <div><h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">Dashboard</h2><p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Vision High School</p></div>
         <div className="flex flex-wrap gap-2">{sortedOfficers.map(s => <OfficerBadge key={s.id} label={s.role} name={s.name} />)}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard label={role === 'student' ? "Assistant Tasks" : "조교 활동 보고"} value={tasks.filter(t=>t.status==='pending').length} unit={role === 'student' ? "Pending" : "건 대기"} icon={<Edit3 size={24} className="text-orange-500"/>} onClick={onNavigateApproval} clickable color="bg-orange-50/50" />
        <StatCard label={role === 'student' ? "Subjects" : "과목 라이브러리"} value={subjects.length || 15} unit={role === 'student' ? "Folders" : "개 아카이브"} icon={<BookOpen size={24} className="text-purple-500"/>} onClick={onNavigateSubjects} clickable color="bg-purple-50/50" />
        <div className="bg-indigo-900 text-white p-6 md:p-8 rounded-[2rem] shadow-xl flex flex-col justify-center relative overflow-hidden group sm:col-span-2 lg:col-span-1">
          <div className="absolute -right-4 -bottom-4 text-indigo-800 opacity-20 group-hover:scale-110 transition-transform duration-500"><Heart size={140} fill="currentColor"/></div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Bible QT</p>
          <div className="flex justify-between items-end relative z-10"><div><span className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-tight">{classSettings.bibleRange || '사도행전'}</span><p className="text-[11px] text-indigo-200 mt-2 font-medium">질문을 남기고 묵상하세요.</p></div>{role === 'teacher' && <button onClick={onUpdateBible} className="p-3 bg-indigo-800/80 rounded-xl hover:bg-indigo-700 transition-all text-white shadow-sm backdrop-blur-sm"><Settings size={18}/></button>}</div>
        </div>
      </div>
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
          <div className="flex items-center gap-3 mb-6 md:mb-8 text-slate-900"><div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[15px] shadow-md">{today[0]}</div><div><h4 className="text-xl md:text-2xl font-black tracking-tight uppercase tracking-tighter">Today's Timeline</h4><p className="text-xs font-bold text-slate-400 mt-1">블록의 길이는 수업 시간에 비례합니다.</p></div></div>
          <div className="relative w-full overflow-x-auto custom-scrollbar pb-6">
             <div className="min-w-[800px] h-28 relative bg-slate-50 rounded-[1.5rem] border border-slate-100 overflow-hidden mt-4 shadow-inner">
                {[...Array(6)].map((_, i) => (<div key={i} className="absolute top-0 bottom-0 border-l border-slate-200/60 z-0" style={{ left: `${(i * 120) / totalM * 100}%` }}><span className="absolute top-2 left-2 text-[10px] font-black text-slate-300">{9 + i * 2}:00</span></div>))}
                {todaySchedule.length > 0 ? todaySchedule.map((item, idx) => {
                  const startM = timeToMinutes(item.start); const endM = timeToMinutes(item.end);
                  const left = ((startM - dayStartM) / totalM) * 100; const width = ((endM - startM) / totalM) * 100;
                  return (
                    <div key={idx} onClick={()=>onSelectSubjectByTitle(item.s)} className={`absolute top-1/2 -translate-y-1/2 h-16 rounded-[1rem] cursor-pointer transition-transform hover:scale-[1.02] shadow-sm flex flex-col items-center justify-center px-2 group z-10 ${getBlockStyle(item.s)}`} style={{ left: `${left}%`, width: `${width}%` }}>
                       <span className="text-[14px] md:text-[15px] leading-none mb-1">{getBlockIcon(item.s)}</span><span className="text-[11px] md:text-[12px] font-black truncate w-full text-center leading-tight">{item.s}</span><div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-3 rounded-lg pointer-events-none whitespace-nowrap shadow-lg">{item.start} - {item.end}</div>
                    </div>
                  );
                }) : <div className="absolute inset-0 flex items-center justify-center text-slate-300 italic font-bold">오늘은 등록된 수업 일정이 없습니다.</div>}
                {isSchoolHours && (<div className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ left: `${nowPercent}%` }}><div className="absolute -top-3 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-md">NOW</div></div>)}
             </div>
          </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 text-[14px]">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative text-slate-900">
          <div className="flex justify-between items-center mb-6 md:mb-8"><h3 className="font-black text-xl md:text-2xl flex items-center gap-3 text-red-500 uppercase tracking-tighter"><Megaphone size={28}/> Notice</h3>{role === 'teacher' && <button onClick={onOpenRoutine} className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 flex items-center gap-1.5 shadow-sm transition-all"><ClipboardList size={14}/> 루틴 게시</button>}</div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {events.length > 0 ? events.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(t => (
              <div key={t.id} className="flex items-center justify-between p-5 md:p-6 bg-red-50/40 rounded-[1.5rem] border border-red-100/50 group hover:shadow-md hover:bg-red-50/80 transition-all"><div className="flex items-center gap-5 md:gap-6"><div className="bg-red-500 px-3 py-1.5 rounded-xl text-white font-black text-[10px] md:text-[11px] group-hover:scale-110 transition-transform shadow-md">{calculateDDay(t.dueDate)}</div><div><p className="font-black text-slate-800 text-[15px] leading-tight mb-1">{t.title}</p><p className="text-[10px] md:text-[11px] text-red-400 font-bold uppercase tracking-widest">Official Board</p></div></div><ChevronRight size={20} className="text-red-200 group-hover:text-red-400 transition-colors"/></div>
            )) : <p className="text-slate-300 italic text-center py-20 text-base font-medium">새로운 공지가 없습니다.</p>}
          </div>
        </div>
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-slate-900">
          <h3 className="font-black text-xl md:text-2xl mb-6 md:mb-8 flex items-center gap-3 text-indigo-600 uppercase tracking-tighter"><Flag size={28}/> D-Day</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {assignments.length > 0 ? assignments.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).map(t => (
              <div key={t.id} onClick={()=>onSelectSubjectByTitle(t.subjectId)} className="flex items-center justify-between p-5 md:p-6 bg-slate-50/80 rounded-[1.5rem] border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all group"><div className="flex items-center gap-5 md:gap-6"><div className="bg-indigo-600 px-3 py-1.5 rounded-xl text-white font-black text-[10px] md:text-[11px] group-hover:scale-110 transition-transform shadow-md">{calculateDDay(t.dueDate)}</div><div><p className="font-bold text-[15px] text-slate-800 leading-tight mb-1">{t.title}</p><p className="text-[10px] md:text-[11px] text-slate-400 uppercase font-black tracking-widest">{t.subjectId} 마감</p></div></div><ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-400 transition-colors"/></div>
            )) : <p className="text-slate-300 italic text-center py-20 text-base font-medium">진행 중인 과제가 없습니다.</p>}
          </div>
        </div>
      </div>

      <div className="pt-6 md:pt-10">
        <h3 className="font-black text-2xl md:text-3xl mb-8 md:mb-12 flex items-center gap-4 text-slate-900 border-l-[12px] border-indigo-600 pl-6 md:pl-8 tracking-tighter uppercase">Weekly Task Scheduler</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">
          {['월', '화', '수', '목', '금'].map(d => {
            const dayTasks = approvedTasks.filter(t => t.day === d && t.taskType !== '일반 공지'); 
            if (dayTasks.length === 0) return null;
            return (
              <div key={d} className="bg-white p-6 md:p-8 rounded-[2.5rem] min-h-[300px] md:min-h-[350px] border border-indigo-400 shadow-[0_15px_40px_rgba(79,70,229,0.08)] ring-4 ring-indigo-50/50 transition-all">
                <h4 className="text-center font-black text-base md:text-lg mb-8 pb-4 border-b-2 border-indigo-50 uppercase tracking-[0.2em] text-indigo-600">{d}</h4>
                <div className="space-y-4">
                  {dayTasks.map(t => (
                    <div key={t.id} onClick={()=>onSelectSubjectByTitle(t.subjectId)} className={`p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-xl border-none transform transition-all cursor-pointer hover:-translate-y-1 ${t.taskType === '그룹 과제' ? 'bg-purple-600 shadow-purple-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
                      <p className="text-[9px] md:text-[10px] font-black uppercase opacity-70 mb-1.5 tracking-widest">{t.subjectId}</p>
                      <p className="text-[13px] md:text-[14px] font-black leading-snug">{t.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {approvedTasks.length === 0 && <div className="col-span-5 py-32 text-center text-slate-300 font-bold opacity-50 text-2xl italic">등록된 주간 학습 일정이 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}

function SubjectDetailView({ role, subject, tasks, students, submissions, onBack, onEdit, onAddNewTaskForSubject, onToggle, onGroupSubmit, currentUser }) {
  const sTasks = tasks.filter(t => t.subjectId === subject.title).sort((a,b) => new Date(b.dueDate) - new Date(a.dueDate));
  return (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-10"><button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-black"><ChevronLeft/> 돌아가기</button><div className="flex gap-2"><button onClick={()=>onAddNewTaskForSubject(subject.title)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2"><Plus size={14}/> 활동 추가</button>{role==='teacher'&&<button onClick={onEdit} className="p-2 bg-slate-50 text-slate-400 rounded-xl"><Settings size={18}/></button>}</div></div>
      <div className="flex justify-between items-end border-b border-slate-50 pb-10 mb-10"><div><h3 className="text-5xl font-black tracking-tighter mb-2">{subject.title}</h3><p className="text-indigo-600 font-black uppercase text-xs tracking-widest">Asst: {subject.representative}</p></div><div className="flex gap-3"><LinkMini icon={<HardDrive size={16}/>} url={subject.driveUrl} color="bg-blue-600"/><LinkMini icon={<Globe size={16}/>} url={subject.hiClassUrl} color="bg-green-600"/></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="space-y-6">
            <h4 className="font-black text-xl flex items-center gap-2 text-slate-800"><ListChecks size={24}/> 활동 기록</h4>
            {sTasks.map(t => (
              <div key={t.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                 <div className="flex justify-between mb-4">
                    <div><span className={`text-[10px] font-black px-2 py-0.5 rounded-md mb-2 inline-block ${t.taskType==='일반 공지'?'bg-red-100 text-red-600':'bg-indigo-100 text-indigo-600'}`}>{t.taskType}</span><h5 className="text-xl font-black">{t.title}</h5><p className="text-slate-500 text-sm mt-2 whitespace-pre-wrap">{t.content}</p></div>
                    <div className="text-right shrink-0"><p className="text-[10px] font-black text-indigo-600">{t.day}요일</p><p className="text-[11px] font-bold text-slate-400">{t.dueDate}</p></div>
                 </div>
                 {t.taskType !== '일반 공지' && (
                    <div className="mt-6 pt-6 border-t border-slate-200/50">
                       {t.taskType === '그룹 과제' && <button onClick={()=>onGroupSubmit(t, currentUser)} className="w-full bg-purple-600 text-white py-3 rounded-xl font-black text-xs mb-4 flex items-center justify-center gap-2 shadow-md hover:bg-purple-700 transition-colors"><Users2 size={16}/> 팀원 선택 및 일괄 제출하기</button>}
                       <div className="grid grid-cols-3 gap-2">{students.map(s => { const sub = submissions[`${t.id}_${s.name}`] || { student: false, teacher: false }; return (<div key={s.id} className={`p-2 rounded-xl border text-center transition-all ${sub.student?'bg-indigo-50 border-indigo-100':'bg-white border-slate-100'}`}><p className="text-[10px] font-black truncate">{s.name}</p><div className="flex gap-1 mt-2"><button onClick={()=>onToggle(t.id, s.name, 'student')} className={`flex-1 py-1 rounded-lg text-[9px] font-black ${sub.student?'bg-indigo-600 text-white':'bg-slate-50 text-slate-400'}`}>제출</button>{role==='teacher'&&<button onClick={()=>onToggle(t.id, s.name, 'teacher')} className={`flex-1 py-1 rounded-lg text-[9px] font-black ${sub.teacher?'bg-green-500 text-white':'bg-slate-50 text-slate-400'}`}>확인</button>}</div></div>); })}</div>
                    </div>
                 )}
              </div>
            ))}
         </div>
         <div className="bg-slate-900 rounded-[3rem] p-12 text-center text-white flex flex-col justify-center min-h-[400px]">
            <FolderOpen className="mx-auto mb-8 opacity-40" size={60}/><h5 className="text-3xl font-black mb-4">Resources Hub</h5><p className="text-slate-400 mb-10 leading-relaxed">이 과목의 외부 클라우드 링크를 통해<br/>자료를 열람하고 제출할 수 있습니다.</p>
            {subject.driveUrl || subject.hiClassUrl ? (<div className="space-y-3 max-w-xs mx-auto w-full">{subject.driveUrl && <a href={subject.driveUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-blue-600 rounded-2xl font-black">구글 드라이브</a>}{subject.hiClassUrl && <a href={subject.hiClassUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-4 bg-green-600 rounded-2xl font-black">하이클래스</a>}</div>):<p className="text-slate-600 italic">설정된 링크가 없습니다.</p>}
         </div>
      </div>
    </div>
  );
}

function StatusView({ students, tasks, submissions, onToggle }) {
  const [vm, setVm] = useState('grid');
  return (
    <div className="space-y-10">
       <header className="flex justify-between items-center"><h2 className="text-3xl font-black">제출 현황 데이터</h2><div className="bg-white p-1 rounded-xl flex border border-slate-200 shadow-sm"><button onClick={()=>setVm('grid')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${vm==='grid'?'bg-indigo-600 text-white shadow-md':'text-slate-400'}`}>매트릭스</button><button onClick={()=>setVm('stats')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${vm==='stats'?'bg-indigo-600 text-white shadow-md':'text-slate-400'}`}>학생 통계</button><button onClick={()=>setVm('subject')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${vm==='subject'?'bg-indigo-600 text-white shadow-md':'text-slate-400'}`}>과목 통계</button></div></header>
       {vm==='grid' && (<div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto"><table className="w-full text-left border-collapse min-w-[800px]"><thead><tr className="bg-slate-50 border-b border-slate-100"><th className="p-6 font-black text-slate-400 uppercase tracking-widest text-[11px] sticky left-0 bg-slate-50 z-10 border-r border-slate-100">학생</th>{tasks.map(t=>(<th key={t.id} className="p-6 font-black text-[12px] border-l border-slate-50"><p className="text-indigo-600 text-[9px] mb-1">{t.subjectId}</p><p className="truncate w-32">{t.title}</p></th>))}</tr></thead><tbody>{students.map(s=>(<tr key={s.id} className="hover:bg-slate-50 transition-all border-b border-slate-50"><td className="p-6 font-black sticky left-0 bg-white border-r border-slate-100 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">{s.name}</td>{tasks.map(t=>{ const sub = submissions[`${t.id}_${s.name}`]||{student:false,teacher:false}; return (<td key={t.id} className="p-6"><div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${sub.student?'bg-indigo-600':'bg-slate-200'}`}/><button onClick={()=>onToggle(t.id, s.name, 'teacher')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${sub.teacher?'bg-green-500 text-white':'bg-slate-100 text-slate-400'}`}>{sub.teacher?'확인됨':'확인'}</button></div></td>); })}</tr>))}</tbody></table></div>)}
       {vm==='stats' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">{students.map(s=>{ const missing = tasks.filter(t=>!submissions[`${t.id}_${s.name}`]?.student); const progress = tasks.length===0?0:Math.round(((tasks.length-missing.length)/tasks.length)*100); return (<div key={s.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"><div className="flex justify-between items-center mb-6"><h4 className="text-xl font-black">{s.name}</h4><span className="text-2xl font-black text-indigo-600">{progress}%</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6"><div className="bg-indigo-600 h-full transition-all" style={{width:`${progress}%`}}/></div><h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">미제출 리스트</h5><ul className="space-y-2">{missing.map(m=>(<li key={m.id} className="text-[12px] p-2 bg-red-50 text-red-600 rounded-lg flex justify-between"><span className="font-bold">{m.subjectId}</span><span className="truncate w-32 text-right">{m.title}</span></li>))}</ul>{missing.length===0&&<p className="text-green-600 font-black text-center py-4">모든 과제 완료! ✨</p>}</div>); })}</div>)}
       {vm==='subject' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[...new Set(tasks.map(t=>t.subjectId))].map(sub=>{ const subTasks = tasks.filter(t=>t.subjectId===sub); let submittedCount=0; subTasks.forEach(t=>students.forEach(s=>{if(submissions[`${t.id}_${s.name}`]?.student) submittedCount++;})); const totalExpected = subTasks.length * students.length; const progress = totalExpected===0?0:Math.round((submittedCount/totalExpected)*100); return (<div key={sub} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"><h4 className="text-xl font-black mb-6">{sub}</h4><div className="flex justify-between mb-2"><span className="text-xs font-bold text-slate-400">전체 제출률</span><span className="text-lg font-black text-indigo-600">{progress}%</span></div><div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6"><div className="bg-indigo-600 h-full transition-all" style={{width:`${progress}%`}}/></div><h5 className="text-[10px] font-black text-slate-400 uppercase mb-4">과제별 현황</h5><ul className="space-y-2">{subTasks.map(t=>{ let tc=0; students.forEach(s=>{if(submissions[`${t.id}_${s.name}`]?.student) tc++;}); return (<li key={t.id} className="text-xs p-3 bg-slate-50 rounded-xl flex justify-between items-center"><span className="font-bold truncate w-32">{t.title}</span><span className="font-black text-indigo-600">{tc}/{students.length}명</span></li>); })}</ul></div>);})}</div>)}
    </div>
  );
}

function ApprovalList({ role, tasks, onApprove, onReject, onEdit, onAdd, calculateDDay }) {
  const [view, setView] = useState('pending');
  const filtered = tasks.filter(t => view === 'pending' ? t.status === 'pending' : t.status === 'approved').sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div className="flex gap-2"><button onClick={()=>setView('pending')} className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${view==='pending'?'bg-indigo-600 text-white shadow-xl':'bg-white text-slate-400 border border-slate-100'}`}>승인 대기</button><button onClick={()=>setView('history')} className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${view==='history'?'bg-indigo-600 text-white shadow-xl':'bg-white text-slate-400 border border-slate-100'}`}>처리 기록</button></div>
         <button onClick={onAdd} className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-[12px] shadow-sm"><Plus size={14}/> 새 활동 보고</button>
      </div>
      <div className="space-y-6">{filtered.map(t => (<div key={t.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all"><div className="flex items-center gap-6"><div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><Megaphone size={30} /></div><div><div className="flex gap-2 mb-2"><span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">{t.subjectId}</span><span className="text-[10px] font-bold text-slate-300">{t.dueDate}</span></div><h4 className="font-black text-xl mb-2"><span className="text-xs font-black text-indigo-400 mr-2">[{t.taskType}]</span>{t.title}</h4><p className="text-sm text-slate-500 line-clamp-2">{t.content}</p></div></div><div className="flex gap-3"><button onClick={() => onEdit(t)} className="p-4 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600"><Edit3 size={20}/></button>{role === 'teacher' && view === 'pending' && <button onClick={() => onApprove(t.id)} className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 shadow-xl flex items-center gap-2"><Check size={20} /> 승인</button>}</div></div>))}</div>
      {filtered.length === 0 && <div className="py-20 text-center text-slate-300 font-bold bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-xl italic">해당 내역이 없습니다.</div>}
    </div>
  );
}