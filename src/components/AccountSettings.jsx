import { useEffect, useState } from 'react';
import { ArrowRight, Shield, UserRound, SlidersHorizontal, LockKeyhole, Download, Trash2, LogOut, Save, Sun, Moon, Monitor, Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AccountSettings({user,usage,instructions,setInstructions,theme,setTheme,language,setLanguage,onSave,onBack,onNotice}){
  const [tab,setTab]=useState('general');
  const [name,setName]=useState(user.user_metadata?.display_name||'');
  const [newEmail,setNewEmail]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [hidePreview,setHidePreview]=useState(localStorage.getItem('zuno_hide_preview')==='true');
  const [confirmBeforeDelete,setConfirmBeforeDelete]=useState(localStorage.getItem('zuno_confirm_delete')!=='false');
  const [compact,setCompact]=useState(localStorage.getItem('zuno_compact')==='true');
  const [enterSends,setEnterSends]=useState(localStorage.getItem('zuno_enter_sends')!=='false');
  const [reduceMotion,setReduceMotion]=useState(localStorage.getItem('zuno_reduce_motion')==='true');
  const [showUsage,setShowUsage]=useState(localStorage.getItem('zuno_show_usage')!=='false');
  const [sessionsInfo,setSessionsInfo]=useState('تتم إدارة جلسة الدخول عبر مزوّد المصادقة الآمن.');

  useEffect(()=>{setName(user.user_metadata?.display_name||'')},[user.id]);
  function flash(text){setMessage(text);setError('')}
  function fail(text){setError(text);setMessage('')}
  async function saveProfile(){
    setBusy(true);try{const {error}=await supabase.auth.updateUser({data:{display_name:name.trim()}});if(error)throw error;await onSave();flash('تم حفظ بيانات الحساب والإعدادات.')}catch(e){fail(e.message)}finally{setBusy(false)}
  }
  async function changePassword(e){
    e.preventDefault();if(newPassword.length<8){fail('استخدم كلمة مرور من 8 أحرف على الأقل.');return}if(newPassword!==confirmPassword){fail('كلمتا المرور غير متطابقتين.');return}
    setBusy(true);try{const {error}=await supabase.auth.updateUser({password:newPassword});if(error)throw error;setNewPassword('');setConfirmPassword('');flash('تم تحديث كلمة المرور.')}catch(e){fail(e.message)}finally{setBusy(false)}
  }
  async function requestEmailChange(e){
    e.preventDefault();if(!newEmail.trim())return;setBusy(true);try{const {error}=await supabase.auth.updateUser({email:newEmail.trim()});if(error)throw error;flash('أرسلنا رسالة تأكيد إلى البريد الجديد. أكمل التحقق لتفعيل التغيير.');setNewEmail('')}catch(e){fail(e.message)}finally{setBusy(false)}
  }
  async function exportData(){
    setBusy(true);try{
      const {data:conversations,error:cError}=await supabase.from('conversations').select('id,title,created_at,updated_at').eq('user_id',user.id).order('created_at',{ascending:true});
      if(cError)throw cError;
      const {data:messages,error:mError}=await supabase.from('messages').select('id,conversation_id,role,content,created_at').eq('user_id',user.id).order('created_at',{ascending:true});
      if(mError)throw mError;
      const blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),account:{email:user.email,created_at:user.created_at},conversations:conversations||[],messages:messages||[]},null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='zuno-my-data.json';a.click();URL.revokeObjectURL(url);flash('تم تجهيز نسخة بياناتك وتنزيلها.');
    }catch(e){fail(e.message)}finally{setBusy(false)}
  }
  async function clearHistory(){
    setBusy(true);try{const {error}=await supabase.from('conversations').delete().eq('user_id',user.id);if(error)throw error;setConfirmDelete(false);flash('تم حذف محادثات حسابك.')}catch(e){fail(e.message)}finally{setBusy(false)}
  }
  const nav=[['general','عام',SlidersHorizontal],['profile','الملف الشخصي',UserRound],['privacy','الخصوصية',Shield],['security','الأمان',LockKeyhole]];
  return <main className="account-settings-page">
    <header className="settings-topbar"><button className="settings-back" onClick={onBack}><ArrowRight size={18}/> العودة إلى ZUNO</button><div className="settings-brand">ZUNO<span>.</span></div><div className="settings-top-label">مركز الحساب</div></header>
    <div className="settings-layout">
      <aside className="settings-sidebar"><div className="settings-user"><div className="settings-avatar">{(name||user.email||'Z').slice(0,1).toUpperCase()}</div><div><b>{name||'حساب ZUNO'}</b><small dir="ltr">{user.email}</small></div></div><p className="settings-nav-label">إدارة الحساب</p>{nav.map(([id,label,Icon])=><button key={id} className={'settings-nav-item '+(tab===id?'active':'')} onClick={()=>{setTab(id);setMessage('');setError('')}}><Icon size={17}/>{label}</button>)}<div className="settings-sidebar-bottom"><button onClick={()=>supabase.auth.signOut()}><LogOut size={16}/> تسجيل الخروج</button></div></aside>
      <section className="settings-content">
        <div className="settings-heading"><span>إعدادات الحساب</span><h1>{nav.find(x=>x[0]===tab)?.[1]}</h1><p>تحكّم بتجربتك وبياناتك وطرق حماية حسابك.</p></div>
        {tab==='general'&&<div className="settings-card"><div className="settings-card-title"><SlidersHorizontal size={18}/><div><b>تفضيلات الاستخدام</b><small>خصص تجربة ZUNO كما تحب.</small></div></div>
          <label className="settings-field">تعليمات المساعد<textarea value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="مثلاً: أفضّل الإجابات المختصرة والواضحة."/></label>
          <div className="settings-field"><span>لغة الواجهة</span><select value={language} onChange={e=>setLanguage(e.target.value)}><option value="auto">تلقائي</option><option value="ar">العربية</option><option value="en">English</option></select></div>
          <div className="settings-field"><span>المظهر</span><div className="theme-choices"><button className={theme==='dark'?'chosen':''} onClick={()=>setTheme('dark')}><Moon size={16}/> داكن</button><button className={theme==='light'?'chosen':''} onClick={()=>setTheme('light')}><Sun size={16}/> فاتح</button><button className={theme==='system'?'chosen':''} onClick={()=>setTheme('system')}><Monitor size={16}/> النظام</button></div></div>
          <div className="settings-extra-preferences">
            <p>تفضيلات إضافية</p>
            <label className="settings-toggle"><span><b>واجهة مدمجة</b><small>تقليل المسافات لعرض محتوى أكثر.</small></span><input type="checkbox" checked={compact} onChange={e=>{setCompact(e.target.checked);localStorage.setItem('zuno_compact',String(e.target.checked));document.documentElement.dataset.density=e.target.checked?'compact':'comfortable'}}/></label>
            <label className="settings-toggle"><span><b>إرسال الرسالة بزر Enter</b><small>أوقفه إذا تفضّل سطراً جديداً عند الضغط على Enter.</small></span><input type="checkbox" checked={enterSends} onChange={e=>{setEnterSends(e.target.checked);localStorage.setItem('zuno_enter_sends',String(e.target.checked))}}/></label>
            <label className="settings-toggle"><span><b>تقليل الحركة</b><small>تقليل الانتقالات والحركات في الواجهة.</small></span><input type="checkbox" checked={reduceMotion} onChange={e=>{setReduceMotion(e.target.checked);localStorage.setItem('zuno_reduce_motion',String(e.target.checked));document.documentElement.dataset.motion=e.target.checked?'reduce':'full'}}/></label>
            <label className="settings-toggle"><span><b>عرض استهلاك الرسائل</b><small>إظهار أو إخفاء شريط الاستهلاك اليومي.</small></span><input type="checkbox" checked={showUsage} onChange={e=>{setShowUsage(e.target.checked);localStorage.setItem('zuno_show_usage',String(e.target.checked))}}/></label>
          </div>
          <div className="settings-usage"><span>استهلاكك اليومي</span><b>{usage?usage.used+' / '+usage.limit+' رسالة':'غير متاح حالياً'}</b></div>
          <button className="settings-save" onClick={saveProfile} disabled={busy}><Save size={16}/> حفظ التغييرات</button>
        </div>}
        {tab==='profile'&&<div className="settings-card"><div className="settings-card-title"><UserRound size={18}/><div><b>معلوماتك الشخصية</b><small>إدارة الاسم والبريد المرتبط بالحساب.</small></div></div>
          <label className="settings-field">الاسم الظاهر<input value={name} onChange={e=>setName(e.target.value)} maxLength={60}/></label>
          <div className="settings-field"><span>البريد الحالي</span><div className="settings-readonly" dir="ltr">{user.email}</div></div>
          <form onSubmit={requestEmailChange} className="settings-inline-form"><label className="settings-field">تغيير البريد الإلكتروني<input type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="new@email.com" required/></label><button className="settings-save" disabled={busy}>إرسال طلب التغيير</button></form>
          <button className="settings-save" onClick={saveProfile} disabled={busy}><Save size={16}/> حفظ الاسم</button>
        </div>}
        {tab==='privacy'&&<div className="settings-card"><div className="settings-card-title"><Shield size={18}/><div><b>الخصوصية والتحكم بالبيانات</b><small>بيانات محادثاتك مرتبطة بحسابك.</small></div></div>
          <div className="privacy-assurance"><Shield size={20}/><div><b>عزل بيانات الحساب</b><p>تُقيّد سياسات قاعدة البيانات قراءة المحادثات والإعدادات بصاحب الحساب المسجّل. لا نعرض محادثاتك للمستخدمين الآخرين.</p></div></div>
          <label className="settings-toggle"><span><b>إخفاء معاينة المحادثات</b><small>إخفاء نصوص المحادثات من قائمة السجل.</small></span><input type="checkbox" checked={hidePreview} onChange={e=>{setHidePreview(e.target.checked);localStorage.setItem('zuno_hide_preview',String(e.target.checked))}}/></label>
          <label className="settings-toggle"><span><b>تأكيد قبل حذف المحادثة</b><small>اطلب تأكيداً قبل حذف سجل محادثة.</small></span><input type="checkbox" checked={confirmBeforeDelete} onChange={e=>{setConfirmBeforeDelete(e.target.checked);localStorage.setItem('zuno_confirm_delete',String(e.target.checked))}}/></label>
          <button className="settings-secondary" onClick={exportData} disabled={busy}><Download size={16}/> تنزيل نسخة من بياناتي</button>
          <div className="settings-danger-zone"><b>حذف سجل المحادثات</b><p>سيحذف محادثات هذا الحساب ورسائلها نهائياً. لا يمكن التراجع عن هذه الخطوة.</p>{!confirmDelete?<button className="settings-danger" onClick={()=>setConfirmDelete(true)}><Trash2 size={15}/> حذف كل المحادثات</button>:<div className="confirm-actions"><button className="settings-danger" onClick={clearHistory} disabled={busy}>أؤكد الحذف</button><button className="settings-secondary" onClick={()=>setConfirmDelete(false)}>إلغاء</button></div>}</div>
        </div>}
        {tab==='security'&&<div className="settings-card"><div className="settings-card-title"><LockKeyhole size={18}/><div><b>الأمان وتسجيل الدخول</b><small>إدارة كلمة المرور والبريد والجلسة.</small></div></div>
          <div className="security-status"><CheckCircle2 size={18}/><span><b>التحقق عبر البريد الإلكتروني</b><small>تسجيل الدخول يتطلب رمز تحقق من 6 أرقام.</small></span></div>
          <form onSubmit={changePassword} className="security-form"><label className="settings-field">تعيين كلمة مرور اختيارية<input type="password" minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="8 أحرف على الأقل" autoComplete="new-password"/></label><label className="settings-field">تأكيد كلمة المرور<input type="password" minLength={8} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="أعد كتابة كلمة المرور" autoComplete="new-password"/></label><button className="settings-save" disabled={busy||!newPassword}><KeyRound size={16}/> تحديث كلمة المرور</button></form>
          <div className="settings-readonly security-session"><b>الجلسة الحالية</b><small>{sessionsInfo}</small></div><button className="settings-secondary" onClick={()=>supabase.auth.signOut()}><LogOut size={16}/> تسجيل الخروج من هذا الجهاز</button>
        </div>}
        {error&&<p className="settings-feedback error">{error}</p>}{message&&<p className="settings-feedback success">{message}</p>}
        <p className="settings-legal">ZUNO · تحكّم ببياناتك وإعداداتك من مكان واحد.</p>
      </section>
    </div>
  </main>
}
