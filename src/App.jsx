import { useEffect, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Check, ChevronRight, CircleCheck, FileText, Gavel, Landmark, Menu, Scale, ShieldCheck, Sparkles, X } from 'lucide-react'
import { api } from './api'

const staticServices = [
  { name: 'Accounting & Finance', category: 'Finance', description: 'Accounting, financial reporting and finance support.' },
  { name: 'Taxation', category: 'Tax', description: 'Direct tax, indirect tax and related advisory support.' },
  { name: 'Audit & Assurance', category: 'Assurance', description: 'Audit, assurance and financial review support.' },
  { name: 'Corporate & Secretarial', category: 'Corporate', description: 'Company secretarial and corporate compliance support.' },
  { name: 'Legal Support', category: 'Legal', description: 'Coordinated legal and documentation support.' },
  { name: 'Business Advisory', category: 'Advisory', description: 'Business, financial and strategic advisory support.' },
  { name: 'Compliance & Outsourcing', category: 'Operations', description: 'Recurring compliance and outsourced professional operations.' }
]

const expertise = [
  ['Finance', Landmark], ['Tax', FileText], ['Audit', ShieldCheck], ['Corporate', BriefcaseBusiness],
  ['Legal', Gavel], ['Advisory', Sparkles]
]

function App() {
  const [services, setServices] = useState(staticServices)
  const [menu, setMenu] = useState(false)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name:'', email:'', phone:'', company:'', service:'', message:'' })

  useEffect(() => {
    api.services().then(setServices).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSending(true)
    try {
      await api.submitEnquiry(form)
      setSent(true); setForm({ name:'', email:'', phone:'', company:'', service:'', message:'' })
    } catch (err) { setError(err.message) }
    finally { setSending(false) }
  }

  return <div className="site">
    <header className="nav">
      <a className="brand" href="#top" onClick={()=>setMenu(false)} aria-label="BrainBanque Global Solutions (P) Ltd">
        <img className="brand-logo header-logo" src={`${import.meta.env.BASE_URL}logo/Brainbanque-logo%20without%20BG.jpg`} alt="BrainBanque Global Solutions" />
        <span className="brand-name">
          <strong><span className="brand-brain">Brain</span><span className="brand-banque">Banque</span></strong>
          <small>Global Solutions (P) Ltd</small>
        </span>
      </a>
      <button className="menu-btn" onClick={()=>setMenu(!menu)} aria-label="Menu">{menu?<X/>:<Menu/>}</button>
      <nav className={menu?'nav-links open':'nav-links'}>
        {['About','Services','Expertise','How we work','Contact'].map(x=><a key={x} href={'#'+x.toLowerCase().replaceAll(' ','-')} onClick={()=>setMenu(false)}>{x}</a>)}
        <a className="nav-cta" href="#contact" onClick={()=>setMenu(false)}>Discuss a requirement <ArrowRight size={16}/></a>
      </nav>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PROFESSIONAL SERVICES • ADVISORY • EXECUTION</p>
          <h1>Complex work.<br/><em>Clear direction.</em></h1>
          <p className="hero-text">Brainbanque brings together multidisciplinary professional expertise to help businesses navigate finance, taxation, compliance, legal and advisory requirements.</p>
          <div className="hero-actions">
            <a className="button primary" href="#contact">Discuss your requirement <ArrowRight size={17}/></a>
            <a className="text-link" href="#services">Explore services <ChevronRight size={17}/></a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-logo-orb" aria-label="BrainBanque logo">
            <div className="logo-ring logo-ring-one"></div>
            <div className="logo-ring logo-ring-two"></div>
            <div className="logo-ring logo-ring-three"></div>
            <div className="logo-smile"></div>
            <img src={`${import.meta.env.BASE_URL}logo/Brainbanque-logo%20without%20BG.jpg`} alt="BrainBanque Global Solutions" />
          </div>
          <div className="panel-bottom"><strong>One coordinated team.</strong><span>Multiple professional disciplines.</span></div>
        </div>
      </section>

      <section className="trust-strip"><span>BUILT AROUND PROFESSIONAL EXPERTISE</span><div>{['CA','CS','LEGAL','FINANCE','ADVISORY'].map(x=><b key={x}>{x}</b>)}</div></section>

      <section className="section intro" id="about">
        <div><p className="eyebrow">ABOUT BRAINBANQUE</p><h2>Professional expertise, coordinated around your requirement.</h2></div>
        <div className="intro-copy"><p>Businesses rarely have one isolated problem. A tax question can touch accounting. A corporate decision can involve legal and compliance work. An expansion can require finance, structuring and execution.</p><p>Brainbanque is designed around that reality — bringing the right professional capabilities together and coordinating the work from requirement to delivery.</p></div>
      </section>

      <section className="section services" id="services">
        <div className="section-head"><div><p className="eyebrow">WHAT WE DO</p><h2>Services built for the work behind the business.</h2></div><span className="section-index">01 — 07</span></div>
        <div className="service-grid">{services.map((s,i)=><article className="service-card" key={s.id||s.name}><span>0{i+1}</span><h3>{s.name}</h3><p>{s.description}</p><a href="#contact">Discuss this service <ArrowRight size={15}/></a></article>)}</div>
      </section>

      <section className="section dark expertise" id="expertise">
        <div className="section-head"><div><p className="eyebrow light">OUR MODEL</p><h2>Different disciplines.<br/>One coordinated approach.</h2></div><p className="dark-copy">Our network is built around professional specialists and practical execution — so clients can access the expertise they need without managing disconnected workstreams.</p></div>
        <div className="expertise-grid">{expertise.map(([name,Icon],i)=><div className="expertise-item" key={name}><Icon size={20}/><span>{name}</span><small>0{i+1}</small></div>)}</div>
      </section>

      <section className="section process" id="how-we-work">
        <div className="section-head"><div><p className="eyebrow">HOW WE WORK</p><h2>From requirement to execution.</h2></div></div>
        <div className="steps">{[['01','Understand','We clarify the requirement, context, scope and expected outcome.'],['02','Coordinate','The right professional capabilities are brought together for the engagement.'],['03','Execute','Work is managed through defined responsibilities, timelines and review points.'],['04','Deliver','You receive a clear outcome, with documentation and ongoing support where required.']].map(([n,t,d])=><div className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
      </section>

      <section className="section statement"><div className="statement-box"><CircleCheck size={28}/><p>Professional work should feel <strong>organised, accountable and clear.</strong></p></div></section>

      <section className="section contact" id="contact">
        <div className="contact-intro"><p className="eyebrow">START A CONVERSATION</p><h2>Tell us what you need to get done.</h2><p>Share the requirement. We’ll understand the context and identify the right path forward.</p></div>
        <form className="form" onSubmit={submit}>
          {sent ? <div className="success"><CircleCheck size={42}/><h3>Thank you.</h3><p>Your requirement has been received. Our team will get in touch.</p><button type="button" className="button outline" onClick={()=>setSent(false)}>Send another enquiry</button></div> :
          <><div className="form-row"><label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label><label>Company<input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company / organisation"/></label></div>
          <div className="form-row"><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@company.com"/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91"/></label></div>
          <label>Service<select value={form.service} onChange={e=>setForm({...form,service:e.target.value})}><option value="">Select an area</option>{services.map(s=><option key={s.name}>{s.name}</option>)}</select></label>
          <label>Requirement<textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows="5" placeholder="Briefly tell us what you need help with..."/></label>
          {error && <p className="form-error">{error}</p>}<button className="button primary full" disabled={sending}>{sending?'Sending…':'Send requirement'} <ArrowRight size={17}/></button></>}
        </form>
      </section>
    </main>

    <footer className="footer"><div className="brand"><img className="brand-logo footer-logo" src={`${import.meta.env.BASE_URL}logo/Brainbanque-logo%20without%20BG.jpg`} alt="BrainBanque Global Solutions" /><span className="brand-name"><strong><span className="brand-brain">Brain</span><span className="brand-banque">Banque</span></strong><small>Global Solutions (P) Ltd</small></span></div><p>Advisory. Expertise. Execution.</p><div>© {new Date().getFullYear()} Brainbanque. All rights reserved.</div></footer>
  </div>
}
export default App