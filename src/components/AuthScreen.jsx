import { useState } from 'react';
import { ArrowLeft, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthScreen(){
  const [email,setEmail]=useState('');
  const [name,setName]=useState('');
  const [code,setCode]=useState('');
  const [step,setStep]=useState('email');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');

  async function sendCode(e){
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try{
      const {error}=await supabase.auth.signInWithOtp({
        email:email.trim().toLowerCase(),
        options:{shouldCreateUser:true,data:name.trim()?{display_name:name.trim()}:{}}
      });
      if(error) throw error;
      setStep('code');
      setNotice('أرسلنا رمز التحقق إلى بريدك. افحص الوارد والرسائل غير المرغوب بها.');
    }catch(err){setError(err.message||'تعذر إرسال الرمز. حاول مرة أخرى.')}
    finally{setBusy(false)}
  }
  async function verifyCode(e){
    e.preventDefault();
    if(!/^\d{6}$/.test(code)){setError('أدخل الرمز المكوّن من 6 أرقام.');return}
    setBusy(true);setError('');setNotice('');
    try{
      const {error}=await supabase.auth.verifyOtp({email:email.trim().toLowerCase(),token:code,type:'email'});
      if(error) throw error;
    }catch(err){setError(err.message||'الرمز غير صحيح أو انتهت صلاحيته.')}
    finally{setBusy(false)}
  }
  return <main className="auth-screen">
    <div className="auth-glow auth-glow-one"/><div className="auth-glow auth-glow-two"/>
    <section className="auth-layout">
      <div className="auth-showcase">
        <div className="auth-orbit"><span className="auth-orbit-dot"/></div>
        <div className="auth-monogram"><span>Z</span></div>
        <div className="auth-wordmark">ZUNO<span className="brand-period">.</span></div>
        <p className="auth-tagline">مساحة هادئة لأفكار أكبر.</p>
        <div className="auth-divider"><i/><span>THINK · CREATE · DISCOVER</span><i/></div>
      </div>
      <div className="auth-panel">
        <div className="auth-panel-top"><span className="auth-eyebrow">مرحباً بك في ZUNO</span><span className="secure-label"><span/> دخول محمي بالتحقق</span></div>
        {step==='email'?<>
          <div className="auth-copy"><h1>دخولك يبدأ ببريدك</h1><p>أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق من 6 أرقام.</p></div>
          <form onSubmit={sendCode}>
            <label>الاسم <span className="optional-label">اختياري</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="كيف نناديك؟" autoComplete="name" maxLength={60}/></label>
            <label>البريد الإلكتروني<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="name@example.com" autoComplete="email"/></label>
            <button className="button-primary" disabled={busy||!email.trim()}>{busy?'جارٍ إرسال الرمز...':'إرسال رمز التحقق'}<Mail size={16}/></button>
          </form>
        </>:<>
          <button className="auth-back" onClick={()=>{setStep('email');setCode('');setError('');setNotice('')}}><ArrowLeft size={15}/> تغيير البريد</button>
          <div className="auth-copy auth-code-copy"><h1>تحقّق من بريدك</h1><p>أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إلى <b dir="ltr">{email}</b>.</p></div>
          <form onSubmit={verifyCode}>
            <label>رمز التحقق<input className="otp-input" dir="ltr" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} required placeholder="000000" maxLength={6}/></label>
            <button className="button-primary" disabled={busy||code.length!==6}>{busy?'جارٍ التحقق...':'تأكيد والدخول'}<ShieldCheck size={16}/></button>
            <button type="button" className="resend-code" disabled={busy} onClick={sendCode}>إعادة إرسال الرمز</button>
          </form>
        </>}
        {error&&<p className="auth-error" role="alert">{error}</p>}
        {notice&&<p className="auth-success" role="status">{notice}</p>}
        <p className="auth-footnote"><Sparkles size={12}/> لا نطلب منك كلمة مرور. لا تشارك رمز التحقق مع أي شخص.</p>
      </div>
    </section>
    <div className="auth-bottom">ZUNO <span>·</span> YOUR SPACE TO THINK</div>
  </main>
}
